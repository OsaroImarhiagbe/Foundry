module.exports = function (api) {
  api.cache(true);
  const environment = process.env.APP_ENV || 'development';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["nativewind/babel"],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: `.env.${environment}`,
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};

