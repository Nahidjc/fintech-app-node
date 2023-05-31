export const JWT = {
    DEVICE_SECRET: 'myjwtdevicesecret',
    ADMIN_SECRET: 'myjwtadminsecret',
    EXPIRES_IN: 10000,
  };
  
  export const USER_TYPES = {
    User: 1,
    Admin: 2,
    Agent: 3,
    Marchant: 4
  };
  
  export const PLATFORM = {
    DEVICE: 1,
    ADMIN: 2,
  };
  
  export const LOGIN_ACCESS: Record<number, number[]> = {
    [USER_TYPES.User]: [PLATFORM.DEVICE],
    [USER_TYPES.Admin]: [PLATFORM.ADMIN],
  };
  
  export const MAX_LOGIN_RETRY_LIMIT = 3;
  export const LOGIN_REACTIVE_TIME = 20;
  
  export const FORGOT_PASSWORD_WITH = {
    LINK: {
      email: true,
      sms: false,
    },
    EXPIRE_TIME: 20,
  };
  