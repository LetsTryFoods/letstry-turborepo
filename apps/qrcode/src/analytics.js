const UAParser = require('ua-parser-js');

/**
 * Parses user agent strings to extract standard device classifications and operating system families.
 * Fully compatible with the output formats of the python 'user-agents' library.
 * 
 * @param {string} userAgentStr - Raw User-Agent header string.
 * @returns {{ deviceType: string, osFamily: string }}
 */
function getDeviceInfo(userAgentStr) {
  const parser = new UAParser(userAgentStr);
  const result = parser.getResult();
  
  let deviceType = 'pc';
  if (result.device && result.device.type === 'mobile') {
    deviceType = 'mobile';
  } else if (result.device && result.device.type === 'tablet') {
    deviceType = 'tablet';
  }
  
  // os.name provides the OS family e.g. 'Android', 'iOS', 'Windows', 'Mac OS'
  const osFamily = (result.os && result.os.name) ? result.os.name : 'Unknown';
  
  return {
    deviceType,
    osFamily
  };
}

/**
 * Returns location mapping for a given IP address.
 * Replicates the demo placeholder behavior in the original implementation.
 * 
 * @param {string} ipAddress - Client IP address string.
 * @returns {string}
 */
function getLocation(ipAddress) {
  return ipAddress;
}

module.exports = {
  getDeviceInfo,
  getLocation
};
