import * as url from "url";
import * as request from "request";
import * as cheerio from "cheerio";

import { InvalidContractError } from './exceptions';

// TODO: Get rid of this eventually.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = 'https://www.gsaelibrary.gsa.gov';

const SEARCH_RESULTS_URL = `${BASE_URL}/ElibMain/searchResults.do`;

export function getContractorInfoURL(contract: string): Promise<string> {
    return new Promise((resolve, reject) => {
        request.get(SEARCH_RESULTS_URL, {
            qs: {
                searchText: contract,
                searchType: 'exactWords',
            },
        }, (err, _, body) => {
            if (err) return reject(err);
            const $ = cheerio.load(body);
            const a = $('a[href^="contractorInfo.do"]');

            if (a.length === 1) {
                const href = url.resolve(SEARCH_RESULTS_URL, a.attr('href'));
                return resolve(href);
            }
            reject(new InvalidContractError(`GSA eLibrary has no results for ${contract}`));
        });
    });
}

export function getContractorInfoHTML(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        request.get(url, {}, (err, _, body) => {
            if (err) return reject(err);
            resolve(body);
        });
    });
}
