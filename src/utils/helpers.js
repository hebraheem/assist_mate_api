import { auth } from '../config/firebase.cjs';
import localStorage from './localStorage.js';

/**
 *
 * @param {express -req} request
 * @param {array of fields to ignore in request.query} ignoreFields
 * @returns formatted query string for gte, gt, lte, and lt that can be used directly
 */
export const rangeQueryString = (request, ignoreFields = []) => {
  const parsedQueryStr = { ...request.query };
  ignoreFields?.forEach((f) => delete parsedQueryStr[f]);

  let filteredQueryStr = JSON.stringify(parsedQueryStr);
  filteredQueryStr = filteredQueryStr?.replace(
    /\b(gte|gt|lte|lt)\b/gi,
    (match) => `$${match}`,
  );

  return JSON.parse(filteredQueryStr);
};

export const authUser = () => {
  return (
    auth.currentUser ?? JSON.parse(localStorage.getItem('userCredential')).user
  );
};
