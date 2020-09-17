import {
  createPageList,
  createFormPageList,
} from 'platform/forms-system/src/js/helpers';
import { createRoutes } from 'platform/forms-system/src/js/routing';
import RoutedSavablePage from './RoutedSavablePage';
import RoutedSavableReviewPage from './RoutedSavableReviewPage';
import FormSaved from './FormSaved';
import SaveInProgressErrorPage from './SaveInProgressErrorPage';

export function createRoutesWithSaveInProgress(formConfig) {
  const protectedRoutes = new Set([
    'introduction',
    'review-and-submit',
    'confirmation',
    '*',
  ]);

  if (Array.isArray(formConfig.additionalRoutes)) {
    formConfig.additionalRoutes.forEach(route => {
      protectedRoutes.add(route.path);
    });
  }

  
  const formPages = createFormPageList(formConfig);
  console.log("25 *****createRoutesWithSaveInProgress formPages *** ",formPages) ;
  const pageList = createPageList(formConfig, formPages);
  console.log("25 *****createRoutesWithSaveInProgress pageList *** ",pageList) ;
  const newRoutes = createRoutes(formConfig);
  console.log("25 *****createRoutesWithSaveInProgress newRoutes *** ",newRoutes) ;

  newRoutes.forEach((route, index) => {
    let newRoute;

    // rewrite page component
    // if (!protectedRoutes.has(route.path)) {
    //   console.log("25 *****createRoutesWithSaveInProgress RoutedSavablePage newRoutes *** ",newRoutes) ;
    //   newRoute = Object.assign({}, route, {
    //     component: RoutedSavablePage,
    //     formConfig,
    //   });
    //   newRoutes[index] = newRoute;
    // }

    console.log("25 *****createRoutesWithSaveInProgress RoutedSavablePage newRoutes *** ",newRoutes) ;
    console.log("25 *****createRoutesWithSaveInProgress RoutedSavablePage RoutedSavablePage *** ",RoutedSavablePage) ;
    newRoute = Object.assign({}, route, {
      component: RoutedSavablePage,
      formConfig,
    });
    newRoutes[index] = newRoute;

    // rewrite review page component
    // if (route.path === 'review-and-submit') {
    //   console.log("25 *****createRoutesWithSaveInProgress RoutedSavableReviewPage newRoutes *** ",newRoutes);
    //   newRoute = Object.assign({}, route, {
    //     component: RoutedSavableReviewPage,
    //   });
    //   newRoutes[index] = newRoute;
    // }
  });

  // if (!formConfig.disableSave) {
  //   newRoutes.splice(newRoutes.length - 1, 0, {
  //     path: 'form-saved',
  //     component: formConfig.formSavedPage || FormSaved,
  //     pageList,
  //     formConfig,
  //   });

  //   newRoutes.splice(newRoutes.length - 1, 0, {
  //     path: 'error',
  //     component: SaveInProgressErrorPage,
  //     pageList, // In case we need it for startOver?
  //     formConfig,
  //   });

  //   newRoutes.splice(newRoutes.length - 1, 0, {
  //     path: 'resume',
  //     pageList,
  //     formConfig,
  //   });
  // }

  console.log("76 *****createRoutesWithSaveInProgress newRoutes *** ",newRoutes) ;
  return newRoutes;
}
