
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import AWS from 'aws-sdk';
import Messages from './Messages';
// Initialize cognito credentials
const cognitoUserPool = () => {
  const poolData = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    ClientId: process.env.COGNITO_CLIENT_ID,
  };
  return new CognitoUserPool(poolData);
};

const cognitoAttribute = (key, value) => {
  if (!key || !value) throw new Error(Messages.ERROR_INVALID_COGNITO_ATTRIBUTES);
  return new CognitoUserAttribute({
    Name: key,
    Value: value,
  });
};

const cognitoSignIn = (username, password) => new Promise((resolve) => {
  const userPool = cognitoUserPool();

  const authenticationDetails = new AuthenticationDetails({ Username: username, Password: password });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    // const accessToken = result.getAccessToken().getJwtToken();
    // Use the idToken for Logins Map when Federating User Pools with
    // identity pools or when passing through an Authorization Header to
    //  an API Gateway Authorizer*/
    // const idToken = result.idToken.jwtToken;
    onSuccess: result => resolve({ success: true, data: result }),
    onFailure: error => resolve({ success: false, message: error.message }),
  });
});

const cognitoRegister = (email, password, firstName = null, middleName = null, lastName = null, phone = null, countryCode = null) => new Promise((resolve, reject) => {
  try {
    const attributeList = [
      cognitoAttribute('email', email),
    ];

    // Check args, if arg exist push to attributeList

    if (firstName) attributeList.push(cognitoAttribute('given_name', firstName));
    if (middleName) attributeList.push(cognitoAttribute('middle_name', middleName));
    if (lastName) attributeList.push(cognitoAttribute('family_name', lastName));
    if (phone) attributeList.push(cognitoAttribute('phone_number', phone));
    if (countryCode) attributeList.push(cognitoAttribute('custom:countryCode', countryCode));

    const userPool = cognitoUserPool();


    userPool.signUp(email, password, attributeList, null, (error, result) => {
      if (error) {
        resolve({ success: false, message: error.message });
      }
      resolve({ success: true, data: result });
    });
  } catch (error) {
    reject(error);
  }
});

const cognitoChangePassword = (username, oldPassword, newPassword) => new Promise((resolve) => {
  const userPool = cognitoUserPool();
  const authenticationDetails = new AuthenticationDetails({ Username: username, Password: oldPassword });
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: () => {
      cognitoUser.changePassword(oldPassword, newPassword, (error, changePasswordResult) => {
        if (error) {
          resolve({ success: false, message: error.message });
        }
        resolve({ success: true, data: changePasswordResult });
      });
    },
    onFailure: error => resolve({ success: false, message: error.message }),
  });
});

const cognitoForgotPassword = username => new Promise((resolve) => {
  const userPool = cognitoUserPool();
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);
  cognitoUser.forgotPassword({
    onSuccess: result => resolve({ success: true, data: result }),
    onFailure: error => resolve({ success: false, message: error.message }),
  });
});

const cognitoPasswordReset = (username, code, newPassword) => new Promise((resolve) => {
  const userPool = cognitoUserPool();
  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);
  cognitoUser.confirmPassword(
    code,
    newPassword,
    {
      onSuccess: result => resolve({ success: true, data: result }),
      onFailure: error => resolve({ success: false, message: error.message }),
    },
  );
});

const snsRegisterDevice = (deviceToken, platform) => new Promise((resolve) => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
    timeout: 15000,
  });
  const platfromArn = platform === 'ios' ? process.env.SNS_IOS_PLATFORM_ENDPOINT : process.env.SNS_ANDROID_PLATFORM_ENDPOINT;
  const sns = new AWS.SNS();
  const snsParams = {
    PlatformApplicationArn: platfromArn,
    Token: deviceToken,
    Attributes: {},
    CustomUserData: '',
  };

  sns.createPlatformEndpoint(snsParams, (error, data) => {
    if (error) {
      resolve({ success: false, message: error.message });
    } else {
      resolve({ success: true, data });
    }
  });
});

const sendSNSMessage = () => new Promise((resolve) => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
    timeout: 15000,
  });
  const sns = new AWS.SNS();
  const params = {
    Message: 'Your trip has arrived',
    TargetArn: 'arn:aws:sns:us-west-2:622260526971:endpoint/APNS_SANDBOX/onemv-ios/385a80fc-ceae-3d75-9277-52048f9e1870',
  };

  sns.publish(params, (err, data) => {
    if (err) console.log(err);
    if (data) console.log(data);
  });

  resolve();
});

export default {
  cognitoPasswordReset,
  cognitoForgotPassword,
  cognitoUserPool,
  cognitoAttribute,
  cognitoSignIn,
  cognitoRegister,
  cognitoChangePassword,
  snsRegisterDevice,
  sendSNSMessage,
};
