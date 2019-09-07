/**
 * The global header megamenu from Drupal.
 *
 */

module.exports = `
      ... on MenuLinkContentHeaderMegamenu {
        menuName
        parent
        weight
        link {
          url {
            path
          }
        }
        fieldPromoReference {
          ... on FieldMenuLinkContentHeaderMegamenuFieldPromoReference {
            targetId
            entity {
              entityId
              entityLabel
              ... on BlockContentPromo {
                fieldImage {
                  targetId
                }
                fieldPromoLink {
                  targetId
                  targetRevisionId
                }
              }
            }
          }
        }
        title
        uuid
        bundle {
          entity {
            entityLabel
          } 
        }
      }
`;
