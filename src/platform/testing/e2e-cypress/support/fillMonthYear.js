/**
 * Fills in a month year date.
 *
 * @param {String} fieldName The name the field without the Month, Day, or Year
 *                           e.g. root_spouseInfo_remarriageDate
 * @param {String} dateString The date as a string
 *                            e.g. 1990-1-28
 */
Cypress.Commands.add('fillMonthYear', (fieldName, dateString) => {
  const date = dateString.split('-');
  cy.get(`select[name="${fieldName}Month"]`)
    .select(parseInt(date[1], 10).toString())
    .get(`input[name="${fieldName}Year"]`)
    .type(parseInt(date[0], 10).toString());
});
