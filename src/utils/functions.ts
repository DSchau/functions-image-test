import { GatsbyFunctionRequest, GatsbyFunctionResponse } from 'gatsby';
import { ContentfulRichTextGatsbyReference } from 'gatsby-source-contentful/rich-text';
import { RefCallback, useCallback, useRef } from 'react';

/**
 * @param hexString a valid hex string with or without the leading #
 * @returns an array with matched [RRR, BBB, GGG] values
 */
export const hexToRGB = (hexString: string) => {
  const hex = hexString.length === 7 ? hexString.substring(1).match(/.{1,2}/g) : hexString.match(/.{1,2}/g);
  const rgbArray = hex && [parseInt(hex[0], 16), parseInt(hex[1], 16), parseInt(hex[2], 16)];
  if (!rgbArray) {
    throw new Error('You must provide a valid hex string');
  }

  return rgbArray as [number, number, number];
};

/**
 * @param string any string, including ones already in camelCase
 * @returns the string in camelCase form
 */
export const toCamelCase = (string: string) =>
  string.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase());

/**
 * @param href any string, most notably a url for either Button or Link
 * @returns `internal` if internal url, `external` if external url and `modal` if passed a falsy value or not a link.
 */
export const behaviorParser = (href?: string | null) => {
  if (!href || !href.includes('http')) {
    return 'internal';
  }

  const domain = 'webstacks.com';
  const url = new URL(href);
  const isInternalLink = url.hostname === `www.${domain}` || url.hostname === domain;

  return isInternalLink ? 'internal' : 'external';
};

/**
 *
 * @param buttonList array of Buttons or richText references from contentful
 * @param button Singular button to determine hierarchy for
 * @returns "`buttonPosition` of `allButtons`"
 */
export const getButtonHierarchy = (
  buttonList: ContentfulRichTextGatsbyReference[],
  button: any,
) => {
  const allButtons = buttonList?.map(item => item?.__typename === 'ContentfulComponentButton' && item.contentful_id);
  const buttonPosition = allButtons ? allButtons?.indexOf(button?.contentful_id || false) + 1 : 0;

  return `${buttonPosition} of ${allButtons.length}`;
};

/**
 *
 * @param onMount (el: T) => void, callback function to run on mount
 * @param onUnmount (el: T) => void, callback function to run on unMount
 * @returns ref
 */
export const useRefWithCallback = <T>(
  onMount: ((el: T) => void) | null,
  onUnmount: ((el: T) => void) | null,
): RefCallback<T> => {
  const nodeRef = useRef<T | null>(null);

  const setRef = useCallback(
    (node: T) => {
      if (nodeRef.current) {
        onUnmount && onUnmount(nodeRef.current);
      }
      nodeRef.current = node;
      if (nodeRef.current) {
        onMount && onMount(nodeRef.current);
      }
    },
    [onMount, onUnmount],
  );

  return setRef;
};

/**
 * Helper function that provides centralized way of handling exceptions.
 * MUST USE for all API ROUTES and to be put inside a `catch` block.
 *
 * @param e Exception
 * @param req Request
 * @param res Response
 */
export const handleException = (e: any, req: GatsbyFunctionRequest, res: GatsbyFunctionResponse) => {
  console.error(e);

  const code = e?.networkError?.statusCode || res?.statusCode || 500;
  const message = e?.networkError?.result?.errors || e?.response?.statusText || e?.message || 'Server Error';

  res.status(code).json({
    success: false,
    code,
    message,
  });
};

/**
 * Helper function that provides centralized way of handling missing query params or body in a request.
 * MUST USE for all API ROUTES.
 *
 * @param res Response
 * @param params Array of string
 * @param object Object referrence for checking
 * @param message Error message string
 */
export const validateProperties = (res: GatsbyFunctionResponse, params: string[], object: any, message: string) => {
  for (const param of params) {
    if (!object || object[param] === undefined) {
      res.status(400);
      throw new Error(`${message}: ${param}`);
    }
  }
};