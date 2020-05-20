/**
 * Callback from a11y check that logs aXe violations to console output.
 *
 * https://github.com/avanslaars/cypress-axe/tree/61631c14a0190329cebc8f8ac9e8f81f1f1ce071#using-the-violationcallback-argument
 *
 * @param {Array} violations - Array of violations returned from the a11y check.
 */
const processAxeCheckResults = violations => {
  const violationMessage = `${violations.length} accessibility violation${
    violations.length === 1 ? ' was' : 's were'
  } detected`;

  // Pluck specific keys to keep the table readable.
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    }),
  );

  cy.task('log', violationMessage);
  cy.task('table', violationData);
};

/**
 * Checks the current page for aXe violations.
 */
Cypress.Commands.add('axeCheck', () => {
  Cypress.log({ name: 'axeCheck' });

  cy.checkA11y(
    '.main',
    {
      includedImpacts: ['critical'],
      runOnly: {
        type: 'tag',
        values: ['section508', 'wcag2a', 'wcag2aa', 'best-practice'],
      },
    },
    processAxeCheckResults,
  );
});
