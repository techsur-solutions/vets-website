import get from '../../../../utilities/data/get';

Cypress.Commands.add('createFieldObject', element => {
  const field = {
    element,
    key: element.prop('name') || element.prop('id'),
    type: element.prop('type') || element.prop('tagName'),
  };

  // Date fields in form data combine all the date components
  // (year, month, day), so treat as one input when filling out dates.
  field.key = field.key.replace(/(Year|Month|Day)$/, () => {
    field.type = 'date';
    return '';
  });

  cy.wrap(field, { log: false });
});

Cypress.Commands.add('findData', field => {
  let fullDataPath;

  cy.get('@testData', { log: false }).then(testData => {
    const relativeDataPath = field.key
      .replace(/^root_/, '')
      .replace(/_/g, '.')
      .replace(/\._(\d+)\./g, (_, number) => `[${number}]`);

    fullDataPath = field.arrayItemPath
      ? `${field.arrayItemPath}.${relativeDataPath}`
      : relativeDataPath;

    cy.wrap(get(fullDataPath, testData.data), { log: false });
  });

  Cypress.log({
    message: field.key,
    consoleProps: () => ({ ...field, fullDataPath }),
  });
});

Cypress.Commands.add('enterData', field => {
  switch (field.type) {
    // Select fields register as having a type === 'select-one'
    case 'select-one':
      cy.wrap(field.element).select(field.data);
      break;

    case 'checkbox': {
      // Only click the checkbox if we need to
      const checked = field.element.prop('checked');
      if ((checked && !field.data) || (!checked && field.data)) {
        cy.wrap(field.element).click();
      }
      break;
    }

    case 'textarea':
    case 'tel':
    case 'email':
    case 'number':
    case 'text': {
      cy.wrap(field.element)
        .clear()
        .type(field.data)
        .then(element => {
          // Get the autocomplete menu out of the way
          if (element.attr('role') === 'combobox') {
            cy.wrap(element).type('{downarrow}{enter}');
          }
        });
      break;
    }

    case 'radio': {
      cy.get(
        `input[name="${field.key}"][value="${
          // Use 'Y' / 'N' because of the yesNo widget
          // eslint-disable-next-line no-nested-ternary
          typeof field.data === 'boolean'
            ? field.data
              ? 'Y'
              : 'N'
            : field.data
        }"]`,
      ).click();
      break;
    }

    case 'date': {
      const dateComponents = field.data.split('-');

      cy.get(`input[name="${field.key}Year"]`)
        .clear()
        .type(dateComponents[0]);

      cy.get(`select[name="${field.key}Month"]`).select(
        parseInt(dateComponents[1], 10).toString(),
      );

      if (dateComponents[2] !== 'XX') {
        cy.get(`select[name="${field.key}Day"]`).select(
          parseInt(dateComponents[2], 10).toString(),
        );
      }

      break;
    }

    case 'file': {
      /*
      if (fieldData) {
        // The upload endpoint should already be mocked; just click the button
        // TODO: Ensure the file we're uploading is valid for this input
        const fileField = await page.$(key);
        // TODO: Change this to not assume the test is being run from the project root
        await fileField.uploadFile('./src/platform/testing/example-upload.png');
      }
      */
      break;
    }

    default:
      throw new Error(`Unknown element type '${field.type}' for ${field.key}`);
  }

  Cypress.log({
    message: field.data,
    consoleProps: () => field,
  });
});

// Check if the current page maps to an array page from the form config.
// If there is a match, get the index from the URL.
// Set up the path prefix for looking up test data under the array item
// that corresponds to this page.
const getArrayItemPath = pathname => {
  cy.get('@arrayPageObjects', { log: false }).then(arrayPageObjects => {
    let index;

    const { arrayPath } =
      arrayPageObjects.find(({ regex }) => {
        const match = pathname.match(regex);
        if (match) [, index] = match;
        return match;
      }) || {};

    return arrayPath ? `${arrayPath}[${parseInt(index, 10)}]` : '';
  });
};

const addNewArrayItem = $form => {
  const arrayTypeDivs = $form.find('div[name^="topOfTable_root_"]');

  if (arrayTypeDivs.length) {
    cy.wrap(arrayTypeDivs).each(arrayTypeDiv => {
      const arrayPath = arrayTypeDiv.attr('name').replace('topOfTable_', '');

      cy.get(
        `div[name$="${arrayPath}"] ~ div:last-of-type > div[name^="table_root_"]`,
      ).then(arrayItemDiv => {
        const lastIndex = parseInt(
          arrayItemDiv.attr('name').match(/\d+$/g),
          10,
        );

        cy.findData({ key: arrayPath }).then(arrayData => {
          if (arrayData.length - 1 > lastIndex) {
            cy.get(
              `div[name="topOfTable_${arrayPath}"] ~ button.va-growable-add-btn`,
            ).click();
          }
        });
      });
    });
  }
};

Cypress.Commands.add('fillPage', () => {
  const ARRAY_ITEM_SELECTOR =
    'div[name^="topOfTable_"] ~ div.va-growable-background';

  const FIELD_SELECTOR = 'input, select, textarea';

  cy.location('pathname', { log: false })
    .then(getArrayItemPath)
    .then(arrayItemPath => {
      const touchedFields = new Set();
      const snapshot = {};

      const fillAvailableFields = () => {
        cy.get('form.rjsf', { log: false })
          .then($form => {
            // Get the starting number of array items and fields to compare
            // after filling out every field that is currently visible.
            snapshot.arrayItemCount = $form.find(ARRAY_ITEM_SELECTOR).length;
            snapshot.fieldCount = $form.find(FIELD_SELECTOR).length;
          })
          .within($form => {
            const fields = $form.find(FIELD_SELECTOR);
            if (!fields.length) return;

            cy.wrap(fields).each(element => {
              cy.createFieldObject(element).then(field => {
                const shouldSkipField =
                  !field.key ||
                  touchedFields.has(field.key) ||
                  !field.key.startsWith('root_');

                if (shouldSkipField) return;

                cy.findData({ ...field, arrayItemPath }).then(data => {
                  if (typeof data !== 'undefined') {
                    cy.enterData({ ...field, data });
                  }

                  touchedFields.add(field.key);
                });
              });
            });

            // Compare the number of fields after filling all the available
            // fields from this iteration. If all currently visible fields
            // have been filled, try adding an array item if possible.
            if (snapshot.fieldCount === $form.find(FIELD_SELECTOR).length) {
              addNewArrayItem($form);
            }

            cy.wrap($form, { log: false });
          })
          .then($form => {
            // If there are new array items or fields to be filled,
            // iterate through the page again.
            const { arrayItemCount, fieldCount } = snapshot;
            const fieldsNeedInput =
              arrayItemCount !== $form.find(ARRAY_ITEM_SELECTOR).length ||
              fieldCount !== $form.find(FIELD_SELECTOR).length;
            if (fieldsNeedInput) fillAvailableFields();
          });
      };

      fillAvailableFields();
    });
});
