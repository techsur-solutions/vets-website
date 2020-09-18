import { createRoutesWithSaveInProgress } from 'platform/forms/save-in-progress/helpers';

//import formConfig from './config/form';
import HealthCareApp from './HealthCareApp.jsx';

// const routes = {
//   path: '/',
//   component: HealthCareApp,
//   indexRoute: {
//     onEnter: (nextState, replace) => replace('/introduction'),
//   },
//   childRoutes: createRoutesWithSaveInProgress(formConfig),
// };

const callRoutedApp = (formConfig)=>{
  console.log("formConfig  ******* ",formConfig);
  console.log("   ******************   ",createRoutesWithSaveInProgress(formConfig));
const routes = {
  path: '/',
  component: HealthCareApp,
  indexRoute:"veteran-chap1/veteranInfo",
  childRoutes: createRoutesWithSaveInProgress(formConfig),
  form: formConfig
};
}



export default callRoutedApp;
