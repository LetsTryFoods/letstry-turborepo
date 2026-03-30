import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (__DEV__) {
  require('../config/reactotron');
}

const API_URL = __DEV__
  ? 'http://192.168.1.37:5000/graphql'
  : 'https://apiv3.letstryfoods.com/graphql';

const httpLink = createHttpLink({ uri: API_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const loggerLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  if (__DEV__ && console.tron) {
    console.tron.display({
      name: `⬆ GQL REQUEST — ${operation.operationName}`,
      preview: `Variables: ${JSON.stringify(operation.variables)}`,
      value: {
        operationName: operation.operationName,
        variables: operation.variables,
        query: operation.query?.loc?.source?.body ?? '',
        headers: operation.getContext().headers,
      },
    });
  }

  return forward(operation).map((response) => {
    const duration = Date.now() - startTime;
    const hasErrors = response.errors && response.errors.length > 0;

    if (__DEV__ && console.tron) {
      console.tron.display({
        name: hasErrors
          ? `❌ GQL ERROR — ${operation.operationName} (${duration}ms)`
          : `✅ GQL RESPONSE — ${operation.operationName} (${duration}ms)`,
        preview: hasErrors
          ? response.errors[0].message
          : `Success in ${duration}ms`,
        value: {
          operationName: operation.operationName,
          variables: operation.variables,
          data: response.data,
          errors: response.errors ?? null,
          duration: `${duration}ms`,
          endpoint: API_URL,
        },
        important: hasErrors,
      });
    }

    return response;
  });
});

const client = new ApolloClient({
  link: authLink.concat(loggerLink).concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
