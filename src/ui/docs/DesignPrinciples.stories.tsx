import type { Meta, StoryObj } from '@storybook/react';

// Documentation component that renders the design principles
const DesignPrinciples = () => (
  <>
    <style>{`
      div {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      h1 {
        font-size: 2.5rem;
        margin-bottom: 2rem;
        border-bottom: 3px solid #007acc;
        padding-bottom: 1rem;
        color: #007acc;
      }
      h2 {
        font-size: 1.8rem;
        margin-top: 3rem;
        margin-bottom: 1rem;
        color: #007acc;
        border-left: 4px solid #007acc;
        padding-left: 1rem;
      }
      h3 {
        font-size: 1.4rem;
        margin-top: 2rem;
        margin-bottom: 0.8rem;
        color: #555;
      }
      code {
        background-color: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: Monaco, Consolas, monospace;
        font-size: 0.9em;
      }
      pre {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.8rem;
        font-family: monospace;
        font-size: 0.9em;
        margin: 1rem 0;
      }

      p {
      margin-bottom: 1rem;}
    `}</style>
    <div>
      <h1>Design principles</h1>

      <h2>Spacing</h2>
      <p>
        Components should never have a margin by default. When you put two
        components next to each other they should &ldquo;stick&rdquo; by default. This way
        you can easily play with different spacing depending on the place where
        you use them.
      </p>
      <p>
        When you want to add margin or padding to a component, you can use the
        following properties that are exposed by the <code>Box</code> component:
      </p>

      <h3>Margin</h3>
      <ul>
        <li>
          <code>marginLeft</code>
        </li>
        <li>
          <code>marginRight</code>
        </li>
        <li>
          <code>marginTop</code>
        </li>
        <li>
          <code>marginBottom</code>
        </li>
        <li>
          <code>marginX</code>
        </li>
        <li>
          <code>marginY</code>
        </li>
        <li>
          <code>margin</code>
        </li>
      </ul>

      <h3>Padding</h3>
      <ul>
        <li>
          <code>paddingLeft</code>
        </li>
        <li>
          <code>paddingRight</code>
        </li>
        <li>
          <code>paddingTop</code>
        </li>
        <li>
          <code>paddingBottom</code>
        </li>
        <li>
          <code>paddingX</code>
        </li>
        <li>
          <code>paddingY</code>
        </li>
        <li>
          <code>padding</code>
        </li>
      </ul>

      <h3>Spacing between child components</h3>
      <p>
        When you use a <code>Stack</code> or <code>Inline</code> you can also
        use the <code>spacing</code> property to define the spacing between
        child components
      </p>
      <p>
        The value you pass down to these properties is a <code>number</code>.
        Behind the scenes this number is parsed to a <code>rem</code> value
        following a specified function, so we get consistent spacing over all
        components.
      </p>

      <h2>Box rules them all</h2>
      <p>
        The Box component is <strong>THE</strong> primitive component what all
        components should be based on. (see
        <a href="#creating-a-new-component">Creating a new component</a>)
      </p>
      <p>
        Box contains all the logic for our design and spacing system. Box
        contains all the margin- and padding-properties as seen above, but it
        also contains a ton of css properties like <code>height</code>,
        <code>fontSize</code>, <code>backgroundColor</code>,
        <code>animation</code>, ... See the full list of properties
        <a href="/story/primitives-box--default-story">here</a>
      </p>

      <h2>Creating a new component</h2>
      <p>
        When creating a new component for our UI-library
        <strong>we always start from one of the primitive components</strong>.
        Those are <code>Box</code>, <code>Stack</code> and <code>Inline</code>.
        <code>Stack</code> and <code>Inline</code> wrap the <code>Box</code>
        component and contain additional styling to represent a column and a row
        respectively.
      </p>
      <p>
        <strong>
          You should first think of using <code>Stack</code> or
          <code>Inline</code> before turning to <code>Box</code>.
        </strong>
      </p>
      <p>
        These primitives contain helper functions to get the necessary
        properties from your component specific to the primitive (e.g. margin,
        padding, color, ...):
      </p>
      <ul>
        <li>
          <code>getBoxProps</code> from <code>Box</code>
        </li>
        <li>
          <code>getInlineProps</code> from <code>Inline</code>
        </li>
        <li>
          <code>getStackProps</code> from <code>Stack</code>
        </li>
      </ul>
      <p>A new component will look something like this:</p>
      <pre>
        <code>{`const MyComponent = ({
  specificProp1,
  specificProp2,
  children,
  className,
  ...props
}) => (
  <Stack
    className={className}
    specificProp1={specificProp1}
    specificProp2={specificProp2}
    {...getStackProps(props)}
  >
    {children}
  </Stack>
);`}</code>
      </pre>
      <p>
        Passing <code>className</code> from parent to child is important for
        styling to be applied correctly.
      </p>
      <p>
        Now we can use <strong>all</strong> the properties from <code>Box</code>
        and <code>Stack</code> on <code>MyComponent</code> like this:
      </p>
      <pre>
        <code>{`<MyComponent spacing={3} backgroundColor="#000000" marginY={4} />`}</code>
      </pre>

      <h2>Adding styles</h2>
      <p>
        We use <a href="https://styled-components.com/">Styled Components</a>
        for the styling of our components. We make use of a
        <a href="https://styled-components.com/docs/api#css-prop">
          <code>css</code> property from Styled Components
        </a>
        on the component itself which makes the style <strong>scoped</strong> by
        default. The use of this css property is integrated deeply into the
        logic of the <code>Box</code> component. Css properties (e.g. font-size,
        background-color, ...) are available on <code>Box</code> as camelcased
        properties (e.g. fontSize, backgroundColor, ...).
      </p>
      <p>
        When you want to add styling to a component your first reflex should be
        to use the existing properties exposed by <code>Box</code>. When
        <code>Box</code> doesn&apos;t contain the property you&rsquo;re looking for, you
        can look into adding it as a property.
      </p>
      <pre>
        <code>{`<MyComponent backgroundColor="red" />`}</code>
      </pre>
      <p>
        As a final resort you can add the necessary styling via the css property
        on the component itself.
      </p>
      <pre>
        <code>{`<MyComponent
  css={\`
    text-transform: uppercase;
    border-bottom: black 1px solid;
  \`}
/>`}</code>
      </pre>
      <p>
        It is a good practice to store the css values you use in
        <code>theme.js</code> and import them by using the
        <code>getValueFromTheme</code> function.
      </p>
      <pre>
        <code>{`import { getValueFromTheme } from '@/ui/theme';

const getValue = getValueFromTheme('myComponent');

<MyComponent backgroundColor={getValue('backgroundColor')} />;`}</code>
      </pre>

      <h2>Bootstrap</h2>
      <p>
        We use
        <a href="https://react-bootstrap.github.io/">
          React Bootstrap components
        </a>
        underneath as implementation for our own custom components, so we can
        recreate the same look and feel in React as we had in AngularJS.
      </p>
      <p>
        Every Bootstrap component we use in React should be wrapped in a custom
        component inside the ui folder. That way we have a more centralized
        place to define how it&apos;s styled and how it should behave.
      </p>
      <p>
        Props on the custom components should not be passed &ldquo;automatically&rdquo; to
        the Bootstrap component underneath. We define a specific list of props
        we use per component to prevent too much flexibility. If we
        <strong>do</strong> need access to a prop that&rsquo;s not currently
        available, it can always be added. Restricting access to props down the
        line is harder.
      </p>

      <h2>Typography</h2>
      <p>
        The root font size is defined once globally and should not be overridden
        in specific components.
      </p>
    </div>
  </>
);

const meta: Meta<typeof DesignPrinciples> = {
  title: 'Introduction/Design Principles',
  component: DesignPrinciples,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Documentation: Story = {};
