import { expect } from 'chai';
import moment from '../../utils/moment-tz';

import {
  getChosenClinicInfo,
  getChosenFacilityInfo,
  getChosenFacilityDetails,
  getClinicPageInfo,
  getClinicsForChosenFacility,
  getDateTimeSelect,
  getFacilityPageInfo,
  getFlowType,
  getFormData,
  getFormPageInfo,
  getNewAppointment,
  getPreferredDate,
  getTypeOfCare,
  getCancelInfo,
  getCCEType,
  isWelcomeModalDismissed,
  selectLocalExpressCareWindowString,
  selectNextAvailableExpressCareWindowString,
} from '../../utils/selectors';

import { selectIsCernerOnlyPatient } from 'platform/user/selectors';
import {
  VHA_FHIR_ID,
  APPOINTMENT_TYPES,
  VIDEO_TYPES,
} from '../../utils/constants';

describe('VAOS selectors', () => {
  describe('getNewAppointment', () => {
    it('should return newAppointment state', () => {
      const state = {
        appointment: {},
        newAppointment: {
          typeOfCareId: '123',
        },
      };
      const newAppointment = getNewAppointment(state);
      expect(newAppointment).to.equal(state.newAppointment);
    });
  });

  describe('getFormData', () => {
    it('should return newAppointment.data', () => {
      const state = {
        appointment: {},
        newAppointment: {
          data: { typeOfCareId: '123' },
        },
      };
      const formData = getFormData(state);
      expect(formData).to.equal(state.newAppointment.data);
    });
  });

  describe('getFlowType', () => {
    it('should return newAppointment state', () => {
      const state = {
        appointment: {},
        newAppointment: {
          data: { typeOfCareId: '123' },
          flowType: 'DIRECT',
        },
      };
      expect(getFlowType(state)).to.equal('DIRECT');
    });
  });

  describe('getFormPageInfo', () => {
    it('should return info needed for form pages', () => {
      const state = {
        newAppointment: {
          pages: {
            testPage: {},
          },
          data: {},
          pageChangeInProgress: false,
        },
      };
      const pageInfo = getFormPageInfo(state, 'testPage');

      expect(pageInfo.pageChangeInProgress).to.equal(
        state.newAppointment.pageChangeInProgress,
      );
      expect(pageInfo.data).to.equal(state.newAppointment.data);
      expect(pageInfo.schema).to.equal(state.newAppointment.pages.testPage);
    });
  });

  describe('getFacilityPageInfo', () => {
    it('should return typeOfCare string and begin loading parentFacilities', () => {
      const state = {
        user: {
          profile: {
            facilities: [],
          },
        },
        newAppointment: {
          pages: {},
          data: {
            typeOfCareId: '160',
            facilityType: 'vamc',
            vaParent: '983',
          },
          facilities: {},
          eligibility: {},
          parentFacilities: [{ identifier: [] }],
          facilityDetails: {},
        },
      };

      const newState = getFacilityPageInfo(state);
      expect(newState.typeOfCare).to.equal('Pharmacy');
      expect(newState.loadingParentFacilities).to.be.true;
    });
    it('should return Cerner facilities', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [
              { facilityId: '668', isCerner: true },
              { facilityId: '124', isCerner: false },
            ],
            isCernerPatient: true,
          },
        },
        newAppointment: {
          pages: {},
          data: {
            typeOfCareId: '160',
            facilityType: 'vamc',
            vaParent: 'some_id',
          },
          facilities: {},
          eligibility: {},
          parentFacilities: [
            {
              id: 'some_id',
              identifier: [{ system: VHA_FHIR_ID, value: '668' }],
            },
          ],
          facilityDetails: {},
          eligibilityStatus: 'failed',
        },
      };

      const newState = getFacilityPageInfo(state);
      expect(newState.cernerOrgIds).to.deep.equal(['some_id']);
    });
  });

  describe('getChosenFacilityInfo', () => {
    it('should return a stored facility object', () => {
      const state = {
        newAppointment: {
          data: {
            typeOfCareId: '323',
            clinicId: '124',
            vaParent: 'var123',
            vaFacility: 'var983',
          },
          facilities: {
            '323_var123': [
              {
                id: 'var983',
              },
            ],
          },
        },
      };

      expect(getChosenFacilityInfo(state)).to.equal(
        state.newAppointment.facilities['323_var123'][0],
      );
    });
  });

  describe('getChosenFacilityDetails', () => {
    it('should return a stored facility details object', () => {
      const state = {
        newAppointment: {
          data: {
            vaFacility: '983',
          },
          facilityDetails: {
            983: {
              institutionCode: '983',
            },
          },
        },
      };

      expect(getChosenFacilityDetails(state)).to.equal(
        state.newAppointment.facilityDetails['983'],
      );
    });
  });

  describe('getChosenClinicInfo', () => {
    it('should return a stored clinic object', () => {
      const state = {
        newAppointment: {
          data: {
            typeOfCareId: '323',
            vaFacility: '688GB',
            clinicId: 'var688GB_124',
          },
          clinics: {
            '688GB_323': [
              {
                id: 'var688GB_123',
              },
              {
                id: 'var688GB_124',
              },
            ],
          },
        },
      };
      const clinic = getChosenClinicInfo(state);
      expect(clinic.id).to.equal(state.newAppointment.data.clinicId);
    });
  });

  describe('getTypeOfCare', () => {
    it('get eye type of care', () => {
      const data = {
        typeOfCareId: 'EYE',
        typeOfEyeCareId: '408',
      };

      const typeOfCare = getTypeOfCare(data);
      expect(typeOfCare.id).to.equal('408');
      expect(typeOfCare.name).to.equal('Optometry');
    });

    it('get sleep type of care', () => {
      const data = {
        typeOfCareId: 'SLEEP',
        typeOfSleepCareId: '349',
      };

      const typeOfCare = getTypeOfCare(data);
      expect(typeOfCare.id).to.equal('349');
      expect(typeOfCare.name).to.equal(
        'Continuous Positive Airway Pressure (CPAP)',
      );
    });

    it('get audiology type of care', () => {
      const data = {
        typeOfCareId: '203',
        audiologyType: 'CCAUDHEAR',
        facilityType: 'communityCare',
      };

      const typeOfCare = getTypeOfCare(data);
      expect(typeOfCare.ccId).to.equal('CCAUDHEAR');
    });

    it('get podiatry type of care', () => {
      const data = {
        typeOfCareId: 'tbd-podiatry',
      };

      const typeOfCare = getTypeOfCare(data);
      expect(typeOfCare.name).to.equal('Podiatry');
    });

    it('get pharmacy type of care', () => {
      const data = {
        typeOfCareId: '160',
      };

      const typeOfCare = getTypeOfCare(data);
      expect(typeOfCare.name).to.equal('Pharmacy');
    });
  });

  describe('getClinicsForChosenFacility', () => {
    it('should return relevant clinics list', () => {
      const state = {
        newAppointment: {
          data: {
            typeOfCareId: '323',
            vaFacility: '688GB',
          },
          clinics: {
            '688GB_323': [
              {
                clinicId: '123',
              },
              {
                clinicId: '124',
              },
            ],
          },
        },
      };
      const clinics = getClinicsForChosenFacility(state);
      expect(clinics).to.equal(state.newAppointment.clinics['688GB_323']);
    });
  });

  describe('getPreferredDate', () => {
    it('should return info needed for form pages', () => {
      const state = {
        newAppointment: {
          pages: {},
          data: {
            typeOfCareId: '323',
          },
          pageChangeInProgress: false,
        },
      };
      const preferredDate = getPreferredDate(state, 'testPage');

      expect(preferredDate.pageChangeInProgress).to.equal(
        state.newAppointment.pageChangeInProgress,
      );
      expect(preferredDate.data).to.equal(state.newAppointment.data);
      expect(preferredDate.schema).to.equal(
        state.newAppointment.pages.preferredDate,
      );
      expect(preferredDate.typeOfCare).to.equal('Primary care');
    });
  });

  describe('getDateTimeSelect', () => {
    it('should return available dates data and timezone', () => {
      const availableSlots = [
        {
          start: '2019-10-24T09:00:00',
          end: '2019-10-24T09:20:00',
        },
        {
          start: '2019-10-24T09:30:00',
          end: '2019-10-24T09:50:00',
        },
      ];

      const state = {
        newAppointment: {
          pages: {
            selectDateTime: {},
          },
          data: {
            typeOfCareId: '323',
            vaParent: 'var983',
            vaFacility: 'var983',
          },
          eligibility: {
            // eslint-disable-next-line camelcase
            var983_323: {
              request: true,
            },
          },
          parentFacilities: [
            {
              id: 'var983',
              identifier: [
                {
                  system: VHA_FHIR_ID,
                  value: '983',
                },
              ],
            },
          ],
          facilities: {
            '323_var983': [
              {
                id: 'var983',
              },
            ],
          },
          availableSlots,
        },
      };

      const data = getDateTimeSelect(state, 'selectDateTime');
      expect(data.timezone).to.equal('America/Denver');
      expect(data.timezoneDescription).to.equal('Mountain time (MT)');
      expect(data.availableDates).to.eql(['2019-10-24']);
      expect(data.availableSlots).to.eql(availableSlots);
    });
  });

  describe('getClinicPageInfo', () => {
    it('should return info needed for the clinic page', () => {
      const state = {
        newAppointment: {
          pages: {},
          data: {
            typeOfCareId: '323',
            vaFacility: '983',
          },
          pageChangeInProgress: false,
          clinics: {},
          eligibility: {
            '983_323': {},
          },
        },
      };
      const pageInfo = getClinicPageInfo(state, 'clinicChoice');

      expect(pageInfo.pageChangeInProgress).to.equal(
        state.newAppointment.pageChangeInProgress,
      );
      expect(pageInfo.data).to.equal(state.newAppointment.data);
      expect(pageInfo.schema).to.equal(state.newAppointment.pages.clinicChoice);
      expect(pageInfo.typeOfCare).to.deep.equal({
        id: '323',
        ccId: 'CCPRMYRTNE',
        group: 'primary',
        name: 'Primary care',
        cceType: 'PrimaryCare',
      });
    });
  });

  describe('getCancelInfo', () => {
    it('should fetch facility in info', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [{ facilityId: '123', isCerner: true }],
            isCernerPatient: true,
          },
        },
        appointments: {
          appointmentToCancel: {
            facility: {
              facilityCode: '123',
            },
          },
          facilityData: {
            var123: {},
          },
        },
      };

      const cancelInfo = getCancelInfo(state);

      expect(cancelInfo.facility).to.equal(
        state.appointments.facilityData.var123,
      );
    });
    it('should fetch facility from clinic map', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [{ facilityId: '123', isCerner: true }],
            isCernerPatient: true,
          },
        },
        appointments: {
          appointmentToCancel: {
            status: 'booked',
            vaos: {
              appointmentType: APPOINTMENT_TYPES.vaAppointment,
            },
            participant: [
              {
                actor: {
                  reference: 'HealthcareService/var123_456',
                  display: 'Test',
                },
              },
              {
                actor: {
                  reference: 'Location/var123',
                  display: 'Facility name',
                },
              },
            ],
          },
          facilityData: {
            var123: {},
          },
        },
      };

      const cancelInfo = getCancelInfo(state);

      expect(cancelInfo.facility).to.equal(
        state.appointments.facilityData.var123,
      );
    });
    it('should fetch facility from video appointment', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [{ facilityId: '123', isCerner: true }],
            isCernerPatient: true,
          },
        },
        appointments: {
          appointmentToCancel: {
            status: 'booked',
            legacyVAR: { apiData: { facilityId: '123' } },
            vaos: {
              appointmentType: APPOINTMENT_TYPES.vaAppointment,
            },
            contained: [
              {
                location: {
                  reference: 'Location/var123',
                },
              },
              {
                resourceType: 'HealthcareService',
                characteristic: [{ coding: VIDEO_TYPES.videoConnect }],
              },
            ],
          },
          facilityData: {
            var123: {},
          },
        },
      };

      const cancelInfo = getCancelInfo(state);

      expect(cancelInfo.facility).to.equal(
        state.appointments.facilityData.var123,
      );
    });
  });

  describe('getCCEType', () => {
    it('should return cce type for Audiology', () => {
      const state = {
        appointment: {},
        newAppointment: {
          data: {
            typeOfCareId: '203',
          },
        },
      };
      const cceType = getCCEType(state);
      expect(cceType).to.equal('Audiology');
    });
    it('should return cce type for Optometry', () => {
      const state = {
        appointment: {},
        newAppointment: {
          data: {
            typeOfCareId: 'EYE',
            typeOfEyeCareId: '408',
          },
        },
      };
      const cceType = getCCEType(state);
      expect(cceType).to.equal('Optometry');
    });
  });

  describe('isWelcomeModalDismissed', () => {
    it('should return dismissed if key is in list', () => {
      const state = {
        announcements: {
          dismissed: ['welcome-to-new-vaos'],
        },
      };
      expect(isWelcomeModalDismissed(state)).to.be.true;
    });
    it('should not return dismissed if key is not in list', () => {
      const state = {
        announcements: {
          dismissed: ['welcome-to-new-va'],
        },
      };
      expect(isWelcomeModalDismissed(state)).to.be.false;
    });
  });

  describe('selectIsCernerOnlyPatient', () => {
    it('should return true if Cerner only', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [{ facilityId: '668', isCerner: true }],
          },
          isCernerPatient: true,
        },
      };
      expect(selectIsCernerOnlyPatient(state)).to.be.true;
    });
    it('should return false if not Cerner only', () => {
      const state = {
        featureToggles: {
          // eslint-disable-next-line camelcase
          show_new_schedule_view_appointments_page: true,
        },
        user: {
          profile: {
            facilities: [
              { facilityId: '668', isCerner: true },
              { facilityId: '124', isCerner: false },
            ],
            isCernerPatient: true,
          },
        },
      };
      expect(selectIsCernerOnlyPatient(state)).to.be.false;
    });
  });

  describe('selectLocalExpressCareWindowString', () => {
    it('should return currently active hours', () => {
      const today = moment();
      const startTime = today
        .clone()
        .subtract('2', 'minutes')
        .tz('America/Denver');
      const endTime = today
        .clone()
        .add('1', 'minutes')
        .tz('America/Denver');
      const state = {
        appointments: {
          expressCareFacilities: [
            {
              facilityId: '983',
              days: [
                {
                  day: today
                    .clone()
                    .tz('America/Denver')
                    .format('dddd')
                    .toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                },
              ],
            },
          ],
        },
      };

      expect(selectLocalExpressCareWindowString(state, today)).to.equal(
        `${startTime.format('h:mm a')} to ${endTime.format('h:mm a')} MT`,
      );
    });

    it('should be empty when not active', () => {
      const today = moment();
      const startTime = today
        .clone()
        .subtract('2', 'minutes')
        .tz('America/Denver');
      const endTime = today
        .clone()
        .subtract('1', 'minutes')
        .tz('America/Denver');
      const state = {
        appointments: {
          expressCareFacilities: [
            {
              facilityId: '983',
              days: [
                {
                  day: today.format('dddd').toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                },
              ],
            },
          ],
        },
      };

      expect(selectLocalExpressCareWindowString(state, today)).not.to.exist;
    });
  });

  describe('selectNextAvailableExpressCareWindowString', () => {
    it('should return today’s schedule if current time is before window start', () => {
      const today = moment();
      const startTime = today
        .clone()
        .add('1', 'minutes')
        .tz('America/Denver');
      const endTime = today
        .clone()
        .add('2', 'minutes')
        .tz('America/Denver');
      const state = {
        appointments: {
          expressCareFacilities: [
            {
              facilityId: '983',
              days: [
                {
                  day: today
                    .clone()
                    .tz('America/Denver')
                    .format('dddd')
                    .toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                },
              ],
            },
          ],
        },
      };

      expect(selectNextAvailableExpressCareWindowString(state, today)).to.equal(
        `today from ${startTime.format('h:mm a')} to ${endTime.format(
          'h:mm a',
        )} MT`,
      );
    });

    it('should return next day’s schedule if current time is after window start', () => {
      const today = moment();
      const tomorrow = moment()
        .add(1, 'days')
        .clone()
        .tz('America/Denver');
      const startTime = today
        .clone()
        .subtract(2, 'minutes')
        .tz('America/Denver');
      const endTime = today
        .clone()
        .subtract(1, 'minutes')
        .tz('America/Denver');
      const state = {
        appointments: {
          expressCareFacilities: [
            {
              facilityId: '983',
              days: [
                {
                  day: today
                    .clone()
                    .tz('America/Denver')
                    .format('dddd')
                    .toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                  dayOfWeekIndex: today.format('d'),
                },
                {
                  day: tomorrow.format('dddd').toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                  dayOfWeekIndex: tomorrow.format('d'),
                },
              ].sort((a, b) => (a.dayOfWeekIndex < b.dayOfWeekIndex ? -1 : 1)),
            },
          ],
        },
      };
      expect(selectNextAvailableExpressCareWindowString(state, today)).to.equal(
        `${tomorrow.format('dddd')} from ${startTime.format(
          'h:mm a',
        )} to ${endTime.format('h:mm a')} MT`,
      );
    });

    it('should return today’s schedule and designate next week if current time is after window start and today is the only schedulable day', () => {
      const today = moment();
      const startTime = today
        .clone()
        .add(-2, 'minutes')
        .tz('America/Denver');
      const endTime = today
        .clone()
        .add(-1, 'minutes')
        .tz('America/Denver');
      const state = {
        appointments: {
          expressCareFacilities: [
            {
              facilityId: '983',
              days: [
                {
                  day: today
                    .clone()
                    .tz('America/Denver')
                    .format('dddd')
                    .toUpperCase(),
                  canSchedule: true,
                  startTime: startTime.format('HH:mm'),
                  endTime: endTime.format('HH:mm'),
                },
              ],
            },
          ],
        },
      };

      expect(selectNextAvailableExpressCareWindowString(state, today)).to.equal(
        `next ${today
          .clone()
          .tz('America/Denver')
          .format('dddd')} from ${startTime.format(
          'h:mm a',
        )} to ${endTime.format('h:mm a')} MT`,
      );
    });
  });
});
