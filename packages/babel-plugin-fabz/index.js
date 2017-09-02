
module.exports = function BabelPluginRelay(context: {types: BabelTypes}): any {
  const {types: t} = context;
  if (!t) {
    throw new Error(
      'BabelPluginRelay: Expected plugin context to include "types", but got:' +
        String(context),
    );
  }

  const visitor = {
    TaggedTemplateExpression(path, state) {
      // Convert graphql`` literals
      const ast = getValidGraphQLTag(path);
      if (ast) {
        compileGraphQLTag(t, path, state, ast);
        return;
      }

      // Convert Relay.QL`` literals
      const [quasi, tagName, propName] = getValidRelayQLTag(path);
      if (quasi && tagName) {
        const schema = state.opts && state.opts.schema;
        invariant(
          schema,
          'babel-plugin-relay: Missing schema option. ' +
            'Check your .babelrc file or wherever you configure your Babel ' +
            'plugins to ensure the "relay" plugin has a "schema" option.\n' +
            'https://facebook.github.io/relay/docs/babel-plugin-relay.html#additional-options',
        );
        const documentName = getDocumentName(path, state);
        path.replaceWith(
          compileRelayQLTag(
            t,
            path,
            schema,
            quasi,
            documentName,
            propName,
            tagName,
            true, // enableValidation
            state,
          ),
        );
      }
    },
  };

  return {
    visitor: {
      Program(path, state) {
        path.traverse(visitor, state);
      },
    },
  };
};
