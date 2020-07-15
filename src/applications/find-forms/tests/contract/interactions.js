const expectedBody = {
  data: [
    {
      id: '10-1170',
      type: 'va_form',
      attributes: {
        formName: '10-1170',
        url: 'https://www.va.gov/vaforms/medical/pdf/vha-10-1170-fill.pdf',
        title:
          'Application for Furnishing Nursing Home Care to Beneficiaries of VA- fillable',
        firstIssuedOn: null,
        lastRevisionOn: '2007-07-01',
        pages: 1,
        sha256:
          '39afe4f79e57d99d008de7f21da341b429cb1bd26b78be6f2d5fce3922fa0aad',
        validPdf: true,
      },
    },
  ],
};

export default {
  oneValidForm: {
    state: 'one valid form exists',
    uponReceiving: 'a request for forms',
    withRequest: {
      method: 'GET',
      path: '/v0/forms',
      headers: {
        'X-Key-Inflection': 'camel',
      },
    },
    willRespondWith: {
      status: 200,
      body: expectedBody,
    },
  },
};
