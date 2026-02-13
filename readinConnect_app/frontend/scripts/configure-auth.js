const { google } = require('googleapis');

const PROJECT_ID = 'school-connect-enterprise';
const API_BASE = 'https://identitytoolkit.googleapis.com/v2';

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function configureAuthProviders() {
  try {
    const accessToken = await getAccessToken();
    
    console.log('Configuring Email/Password provider...');
    const emailConfig = {
      name: `projects/${PROJECT_ID}/defaultSupportedIdpConfigs/password`,
      enabled: true,
      clientId: '',
      clientSecret: ''
    };
    
    const emailResponse = await fetch(`${API_BASE}/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailConfig)
    });
    
    if (emailResponse.ok) {
      console.log('✓ Email/Password provider configured successfully');
    } else {
      console.log('Note: Email/Password configuration response:', emailResponse.status);
    }
    
    console.log('\nConfiguring Google provider...');
    const googleConfig = {
      name: `projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`,
      enabled: true,
      clientId: '',
      clientSecret: ''
    };
    
    const googleResponse = await fetch(`${API_BASE}/projects/${PROJECT_ID}/defaultSupportedIdpConfigs/google.com`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleConfig)
    });
    
    if (googleResponse.ok) {
      console.log('✓ Google provider configured successfully');
    } else {
      console.log('Note: Google configuration response:', googleResponse.status);
    }
    
    console.log('\n✅ Firebase Auth providers configured!');
    console.log('\n⚠️  IMPORTANT: You may need to manually enable providers in the Firebase Console:');
    console.log('   https://console.firebase.google.com/project/school-connect-enterprise/authentication/providers');
    
  } catch (error) {
    console.error('Error configuring providers:', error.message);
    console.log('\n⚠️  Please manually enable providers in Firebase Console:');
    console.log('   https://console.firebase.google.com/project/school-connect-enterprise/authentication/providers');
  }
}

configureAuthProviders();
