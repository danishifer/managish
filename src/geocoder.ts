import axios from 'axios';
import { PROVIDER_BASE_URL_YANDEX, PROVIDER_KEY_YANDEX } from './constants';

class Geocoder {

  decode = (query: string) => {
    return this.decodeYandex(query);
  }

  private decodeHere = (query: string) => {
    return new Promise((resolve, reject) => {
      
    })
  }

  private decodeYandex = (query: string) => {
    return new Promise((resolve, reject) => {
      axios.get('/', {
        baseURL: PROVIDER_BASE_URL_YANDEX,
        headers: {
          'Authorization': null
        },
        params: {
          apikey: PROVIDER_KEY_YANDEX,
          format: 'json',
          lang: 'en-US',
          geocode: query
        }
      }).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
      })
    });
  }
}

export default new Geocoder();