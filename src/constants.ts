export const BASE_URL = 'https://managish.eu-gb.mybluemix.net';
// export const BASE_URL = 'http://localhost:3000';
export const PROVIDER_BASE_URL_YANDEX = 'https://geocode-maps.yandex.ru/1.x';
export const PROVIDER_KEY_YANDEX = '08d4cbb4-913e-4b22-bd9b-0d358f259345';

export interface Reply {
  id: string,
  userId: string,
  text: string,
  timestamp: number,
  votes: {
    positive: string[],
    negative: string[]
  }
}

export interface Review {
  _id: string,
  id: string,
  userId: string,
  text: string,
  placeId: string,
  photo?: string,
  timestamp: number,
  votes: {
    positive: string[],
    negative: string[]
  },
  replies: Reply[]
}