import { SDUIScreen } from '../../types';

export const loyaltyScreen: SDUIScreen = {
  screen: 'GenericScreen',
  components: [
    {
      type: 'TopBanner',
      props: {
        imageUrl: 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev/loyalty-banner.jpg',
        aspectRatio: 2.5
      }
    },
    {
      type: 'Spacer',
      props: { height: 20 }
    },
    {
      type: 'Spacer',
      props: { height: 20 }
    },
    {
      type: 'SDUIForm',
      props: {
        padding: 20,
        onSubmit: {
          type: 'API_CALL',
          endpoint: 'https://jsonplaceholder.typicode.com/posts', // Placeholder API
          method: 'POST',
          payload: {
            phoneNumber: '${form.phone}',
            action: 'join_loyalty'
          },
          onSuccess: {
            type: 'SHOW_TOAST',
            message: 'Successfully joined Loyalty Program!'
          }
        },
        fields: [
          {
            type: 'CartNotice',
            props: {
              text: "Join the Let's Try Loyalty Program! Earn points on every snack.",
              backgroundColor: '#E8F5E9',
              textColor: '#2E7D32',
              borderColor: '#81C784',
              borderWidth: 1,
              padding: 16,
              borderRadius: 12
            }
          },
          {
            type: 'Spacer',
            props: { height: 20 }
          },
          {
            type: 'SDUITextInput',
            props: {
              name: 'phone',
              label: 'Phone Number',
              placeholder: 'Enter your 10-digit phone number',
              keyboardType: 'phone-pad'
            }
          },
          {
            type: 'SDUIButton',
            props: {
              label: 'Join Now',
              isSubmit: true,
              backgroundColor: '#E8A020',
              textColor: '#FFFFFF'
            }
          }
        ]
      }
    }
  ]
};
