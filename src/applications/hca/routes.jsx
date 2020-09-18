import { createRoutesWithSaveInProgress } from 'platform/forms/save-in-progress/helpers';
import {HealthCareEntry} from './HealthCareApp.jsx';

// const routes = {
//   path: '/',
//   component: HealthCareApp,
//   indexRoute: {
//     onEnter: (nextState, replace) => replace('/introduction'),
//   },
//   childRoutes: createRoutesWithSaveInProgress(formConfig),
// };

export function callRoutedApp(formConfig){
  console.log("formConfig  ******* ",formConfig);
  console.log("   ******************   ",createRoutesWithSaveInProgress(formConfig));
  return HealthCareEntry("veteran-chap1/veteranInfo",createRoutesWithSaveInProgress(formConfig),formConfig);
// const routes = {
//   path: '/',
//   component: HealthCareApp,
//   indexRoute:,
//   childRoutes: ,
//   form: formConfig
// };
}

