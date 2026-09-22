// eslint-disable-next-line @typescript-eslint/no-require-imports -- Node's --require preload must be CommonJS.
const os = require("node:os");

const systemUserInfo = os.userInfo;
os.userInfo = (...args) => {
  try {
    return systemUserInfo(...args);
  } catch (error) {
    if (error?.code !== "ERR_SYSTEM_ERROR") throw error;
    return {
      uid: -1,
      gid: -1,
      username: process.env.USERNAME || "test-user",
      homedir: process.env.USERPROFILE || process.cwd(),
      shell: null,
    };
  }
};
