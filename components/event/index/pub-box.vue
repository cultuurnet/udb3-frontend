<template>
  <component :is="as" :class="classes">
    <slot />
  </component>
</template>

<script>
  import upperFirst from 'lodash.upperfirst';
  import merge from 'lodash.merge';

  const directions = [
    '',
    'top',
    'bottom',
    'right',
    'left',
    'vertical',
    'horizontal',
  ];

  const getFirstCharacter = (value) => value.substr(0, 1).toLowerCase();

  // see directions array
  // ex. margin - marginTop - marginBottom etc
  const prepareLayoutProps = (property) => ({
    ...directions.reduce(
      (acc, val) => ({
        ...acc,
        [`${property}${upperFirst(val)}`]: {
          type: [String, Number],
          default: 0,
        },
      }),
      {},
    ),
  });

  // margin = 2 -> pub-m-2
  // marginHorizontal = 1 -> pub-mh-2
  function applyLayoutClasses(property) {
    return directions.reduce((acc, direction) => {
      const propName = `${property}${upperFirst(direction)}`;
      const value = this[propName] || this.injectedProps[propName];

      if (!value) {
        return acc;
      }

      // m - mt - p - ph ...
      const identifier =
        getFirstCharacter(property) + getFirstCharacter(direction);

      return {
        ...acc,
        [`pub-${identifier}-${value}`]: true,
      };
    }, {});
  }

  export const props = (override = {}) =>
    merge(
      {
        ...prepareLayoutProps('margin'),
        ...prepareLayoutProps('padding'),
        as: {
          type: [String, Object],
          default: 'div',
        },
      },
      override,
    );

  export default {
    inject: ['injectedProps'],
    props: props(),
    computed: {
      classes() {
        return {
          'pub-reset': true,
          'pub-reset-list': this.as === 'ol' || this.as === 'ul',
          ...applyLayoutClasses.call(this, 'margin'),
          ...applyLayoutClasses.call(this, 'padding'),
        };
      },
    },
  };
</script>

<style lang="scss" scoped>
  @function parseSpacing($spacing) {
    $value: 1;

    @if $spacing > 0 {
      @for $spacing from 1 through $spacing {
        $value: $value * 2;
      }
      @return #{$value}px;
    }

    @return 0;
  }

  .pub-reset {
    margin: 0;
    padding: 0;
  }

  .pub-reset-list {
    list-style-type: none;
    list-style-position: outside;
  }

  @for $spacing from 0 through 12 {
    .pub-m-#{$spacing} {
      margin: parseSpacing($spacing);
    }

    .pub-mh-#{$spacing} {
      margin-left: parseSpacing($spacing);
      margin-right: parseSpacing($spacing);
    }
    .pub-mv-#{$spacing} {
      margin-top: parseSpacing($spacing);
      margin-bottom: parseSpacing($spacing);
    }

    .pub-mt-#{$spacing} {
      margin-top: parseSpacing($spacing);
    }
    .pub-mb-#{$spacing} {
      margin-bottom: parseSpacing($spacing);
    }
    .pub-mr-#{$spacing} {
      margin-right: parseSpacing($spacing);
    }
    .pub-ml-#{$spacing} {
      margin-left: parseSpacing($spacing);
    }

    .pub-p-#{$spacing} {
      padding: parseSpacing($spacing);
    }

    .pub-ph-#{$spacing} {
      padding-left: parseSpacing($spacing);
      padding-right: parseSpacing($spacing);
    }
    .pub-pv-#{$spacing} {
      padding-top: parseSpacing($spacing);
      padding-bottom: parseSpacing($spacing);
    }

    .pub-pt-#{$spacing} {
      padding-top: parseSpacing($spacing);
    }
    .pub-pb-#{$spacing} {
      padding-bottom: parseSpacing($spacing);
    }
    .pub-pr-#{$spacing} {
      padding-right: parseSpacing($spacing);
    }
    .pub-pl-#{$spacing} {
      padding-left: parseSpacing($spacing);
    }
  }
</style>
