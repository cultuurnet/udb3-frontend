import { Values } from '@/types/Values';

import { getStackProps, Stack, StackProps } from './Stack';

type IconProps = {
  width?: string;
  height?: string;
  color?: string;
};

const IconMap = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 164 173"
    >
      <path
        className="icon-hover-color-stroke"
        d="M160.7 62v.3c0 3.2-.8 6.3-2.2 9-3.4 6.6-10.3 11.1-18.2 11.1V150H23.6c-11.3 0-20.4-9.1-20.4-20.4V45h65.2c5.9 14.3 13.5 29.4 13.5 29.4S89.5 59.3 95.4 45H143c9.6 0 17.3 7.6 17.7 17ZM3.2 45c0-11.3 9.1-20.4 20.4-20.4V45H3.2Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M160.7 62.7V150c0 11.3-9.1 20.4-20.4 20.4v-88c7.9 0 14.8-4.5 18.2-11.1 1.4-2.7 2.2-5.8 2.2-9v.4ZM81.9 2.5c-11.2 0-20.4 9.1-20.4 20.3 0 4.4 3.1 13.1 6.8 22.1 5.9 14.3 13.5 29.4 13.5 29.4s7.6-15.1 13.5-29.4c3.8-9.1 6.8-17.8 6.8-22.1.2-11.2-8.9-20.3-20.2-20.3Zm0 31.6c-5 0-9.1-4.1-9.1-9.1s4.1-9.1 9.1-9.1S91 20 91 25s-4 9.1-9.1 9.1ZM145.9 45.3 38.5 150M109.3 45.3l12 24M52.5 45l-20 49.5-29.3 19.1M61.6 127.5l-29.1-33M103.8 86.3l36.5 38.7M92.2 150l34-40M43.7 66.9l38.2 41.2"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M81.9 118.8c5.91 0 10.7-4.791 10.7-10.7 0-5.91-4.79-10.7-10.7-10.7-5.91 0-10.7 4.79-10.7 10.7 0 5.909 4.79 10.7 10.7 10.7Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconImage = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 162 135"
    >
      <path
        className="icon-hover-color-stroke"
        d="M159.5 107.9H2.5V3.1h157v104.8Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m46.2 48.4 15.3 15.8 25.6-20.6 53 64.3M28.1 29.5 2.5 3.1M159.5 68.6h-51.8"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M46.2 43.9v16.7c0 8.1-6.7 14.8-14.8 14.8-8.1 0-14.8-6.6-14.8-14.8V43.9c0-7 4.9-12.9 11.4-14.4 1.1-.2 2.2-.4 3.4-.4 4.1 0 7.8 1.7 10.4 4.3 2.7 2.8 4.4 6.5 4.4 10.5ZM31.4 75.4v32M127.6 29.1c0 2.6-2.1 4.7-4.7 4.7s-4.8-2.1-4.8-4.7 2.1-4.7 4.8-4.7c2.5 0 4.7 2.1 4.7 4.7ZM140.1 79.5h19.4M144.1 95h-14.6"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M80.6 132.1c13.365 0 24.2-10.835 24.2-24.2 0-13.365-10.835-24.2-24.2-24.2-13.365 0-24.2 10.835-24.2 24.2 0 13.365 10.835 24.2 24.2 24.2Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M92.4 107.9H68.8M80.6 119.7V96"
        stroke="#fff"
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconBadge = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 164 117"
    >
      <path
        d="M161.3 42.9H57.7v60.6h103.6V42.9ZM72.1 57.8h27.8M72.1 71.6H88"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M99.2 42.9C97.1 26.7 80.1 13.1 63.7 7.8 51 3.6 35.4 3.2 23.8 10.6 8.7 20.2 8.4 38.9 14.4 54.2 19 65.9 26.5 76.4 31.1 88.1c1.6 3.9 2.8 8 2.8 12.2-.1 13.2-15.4 18.6-24.4 9.6-5.2-5.2-6.8-13-6.4-20.3.6-10.1 4.6-19.8 10.2-28.3 16.2-24.9 62.4-81 95-48 7.5 7.6 11.5 18.8 12.3 29.3"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M147.5 57.8h-30.9v30.9h30.9V57.8Z"
        className="icon-hover-color-stroke icon-hover-color-fill"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M132.7 73.9h-1.3c-3.7 0-6.7 3-6.7 6.7h14.8c-.1-3.7-3.1-6.7-6.8-6.7ZM132 69.9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconPhysical = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 176 137"
    >
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M74 55.3h-.8c-2.3 0-4.5-.5-6.5-1.3-2.1-.9-3.9-2.2-5.5-3.8l-1.2 1c-3.3 2.7-7.5 4.2-11.8 4.2 0-6.5 5.3-11.7 11.8-11.7h2.3c3.3 0 6.2 1.3 8.4 3.4 2 2 3.3 4.7 3.4 7.7l-.1.5ZM126.5 61.2l1.2-10.9c.4-3.4-3.1-5.9-6.2-4.4l-4 1.9c-1.4-3.9-6.8-3.9-8.2 0l-4-1.9c-3.1-1.5-6.6 1-6.2 4.4l1.2 10.9 2-3.2c2.3-3.7 6.3-6 10.7-6 3.8 0 7.3 1.7 9.7 4.6l3.8 4.6Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M84.1 65.5c0 2.3-1.9 4.3-4.3 4.3h-7l-.7 4.2c-.3 1.8-1 3.5-2.1 4.9-.4.6-.9 1.1-1.5 1.7v17.9c0 4.1-3.3 7.4-7.4 7.4-4.1 0-7.4-3.3-7.4-7.4V80.9c-.7-.6-1.3-1.2-1.8-2-1.1-1.5-1.9-3.3-2.1-5.2l-.5-3.9h-6.8c-2.3 0-4.3-1.9-4.3-4.3 0-1.2.5-2.2 1.2-3 .8-.8 1.8-1.2 3-1.2H48l.1-5.9c0-6.5 5.3-11.7 11.8-11.7h2.3c3.3 0 6.2 1.3 8.4 3.4 2 2 3.3 4.7 3.4 7.7v.6l.1 5.9h5.7c1.2 0 2.2.5 3 1.2.8.8 1.3 1.8 1.3 3Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M53.7 80.8c1.5 1.2 3.3 2.1 5.2 2.4"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M51.9 78.9H40.8l2.8-9.1h5.7l.5 3.9c.2 1.9 1 3.7 2.1 5.2Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke"
        d="M51.9 78.9H40.8l2.8-9.1h5.7l.5 3.9c.2 1.9 1 3.7 2.1 5.2Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M80.9 78.9H70c1.1-1.4 1.8-3.1 2.1-4.9l.7-4.2h5.3l2.8 9.1Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke"
        d="M80.9 78.9H70c1.1-1.4 1.8-3.1 2.1-4.9l.7-4.2h5.3l2.8 9.1ZM136.4 65.5c0 2.3-1.9 4.3-4.3 4.3h-7l-.7 4.2c-.3 1.8-1 3.5-2.1 4.9-.4.6-.9 1.1-1.5 1.7v17.9c0 4.1-3.3 7.4-7.4 7.4-4.1 0-7.4-3.3-7.4-7.4V80.9c-.7-.6-1.3-1.2-1.8-2-1.1-1.5-1.9-3.3-2.1-5.2l-.5-3.9h-6.8c-2.3 0-4.3-1.9-4.3-4.3 0-1.2.5-2.2 1.2-3 .8-.8 1.8-1.2 3-1.2h5.6l.1-1.2c0-6.5 5.3-11.7 11.8-11.7h2.3c3.3 0 6.2 1.3 8.4 3.4 2 2 3.3 4.7 3.4 7.7v.6l.1 1.2h5.7c1.2 0 2.2.5 3 1.2.9.8 1.3 1.8 1.3 3Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M106.1 80.8c1.5 1.2 3.3 2.1 5.2 2.4M104.7 92.5l-14.6 5.3c-6.6 2.4-10.9 8.6-10.9 15.6v20.7H30L18.1 87.2 33.4 82l2 8.9c.8 3.3 4.1 5.3 7.4 4.5l11-2.8v5.5c0 3.8 2.7 7.1 6.4 7.6 4.5.6 8.4-2.9 8.4-7.4v-5.8h36.1ZM23.1 45.5l4-9.2c.7-2.1-.9-4.3-3.1-4.3-1 0-2 .5-2.6 1.3l-2.2 2.9-2.3-7c-1.2-3.7-5.2-5.8-8.9-4.6-4 1.3-6 5.8-4.3 9.6l14.4 52.9 15.3-5.2-10.3-36.4ZM172.7 34.3 167 58l-15.8-4.9 2-7.6-4-9.2c-.7-2.1.9-4.3 3.1-4.3 1 0 2 .5 2.6 1.3l2.2 2.9 2.3-7c1.2-3.7 5.2-5.8 8.9-4.6 4.1 1.3 6.1 5.8 4.4 9.7ZM140.1 114.4c-.7.2-1.5.3-2.2.3-3 0-5.8-1.9-6.8-4.9l-2.3-7-2.2 2.9c-.6.8-1.6 1.3-2.6 1.3-1.9 0-3.3-1.5-3.3-3.3 0-.3 0-.7.2-1l3.1-7.3c.3-.8.8-1.5 1.5-2 1-.8 2.2-1.3 3.5-1.3h7.1c1.4 0 2.7.5 3.7 1.4.6.6 1.1 1.3 1.4 2.2l3.2 9c1.7 3.9-.3 8.4-4.3 9.7Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m167 58-.1.3-16.8 75.8H79v-20.7c0-7 4.4-13.2 11-15.6l14.6-5.3h1.4v5.9c0 4 3.2 7.3 7.2 7.4h.2c4.1 0 7.4-3.3 7.4-7.4v-5.9l4.6.9c-.6.5-1.1 1.2-1.5 2l-3.1 7.3c-.1.3-.1.7-.1 1 0 1.8 1.4 3.3 3.3 3.3 1 0 2-.5 2.6-1.3l2.2-2.9 2.2 7c1 3 3.8 4.9 6.8 4.9.7 0 1.5-.1 2.2-.3 4-1.3 6-5.8 4.3-9.7l-3.2-9c-.3-.8-.8-1.6-1.4-2.2.6-.6 1.1-1.5 1.4-2.4l2.3-8.9.2-.8 7.5-28.3L167 58Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m151.2 53.1-7.5 28.3 7.4-28.3h.1Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M64 22.1c0 2.1-1.7 3.8-3.8 3.8-2.1 0-3.8-1.7-3.8-3.8 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke"
        d="M64 22.1c0 2.1-1.7 3.8-3.8 3.8-2.1 0-3.8-1.7-3.8-3.8 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8ZM64 22.1l3-13.3 3.9 6.1"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M94.3 16.2c0 2.1 1.7 3.8 3.8 3.8 2.1 0 3.8-1.7 3.8-3.8 0-2.1-1.7-3.8-3.8-3.8-2.1 0-3.8 1.7-3.8 3.8Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke"
        d="M94.3 16.2c0 2.1 1.7 3.8 3.8 3.8 2.1 0 3.8-1.7 3.8-3.8 0-2.1-1.7-3.8-3.8-3.8-2.1 0-3.8 1.7-3.8 3.8ZM94.3 16.2l-3-13.3-4 6.1"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M125.9 22.1c0 2.1-1.7 3.8-3.8 3.8-2.1 0-3.8-1.7-3.8-3.8 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke"
        d="M125.9 22.1c0 2.1-1.7 3.8-3.8 3.8-2.1 0-3.8-1.7-3.8-3.8 0-2.1 1.7-3.8 3.8-3.8 2.1 0 3.8 1.7 3.8 3.8ZM125.9 22.1l3-13.3 4 6.1"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconPhone = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 136 116"
    >
      <path
        className="icon-hover-color-stroke"
        d="m121.4 11.6-3.2 11.8h-.1l-2.7 9.9h-3.3c-2.1 0-4 .9-5.4 2.2-1.4 1.4-2.2 3.3-2.2 5.4 0 3.9 3 7.2 6.8 7.6h-2.8c-2.1 0-4 .9-5.4 2.2-1.4 1.4-2.2 3.3-2.2 5.4 0 3.8 2.7 6.9 6.3 7.5v.1h-2.8c-2.1 0-4 .9-5.4 2.2-1.4 1.4-2.2 3.3-2.2 5.4 0 3.8 2.7 6.9 6.3 7.5v.1h-2c-1.6 0-3 .6-4.1 1.7-1 1.1-1.7 2.5-1.7 4.1 0 2.8 1.9 5.1 4.6 5.6-2.1 5.5-7.4 9.2-13.3 9.2H53.8c-4.5 0-7.7-4.3-6.5-8.6L68 15.6l.6-2.1C70.3 7.3 75.9 3 82.4 3h32.8c4.1 0 7.4 4.3 6.2 8.6Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M106.6 30.2 103.4 42H71.5l3.4-11.8h31.7ZM100.6 54.1l-3.4 12.6h-32l3.6-12.6h31.8Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M80.9 99.5 70.3 109c-2.9 2.6-6.7 4-10.6 4H2.9V66.7l25.6-9.9c1.3-.5 2.5-1.5 3.2-2.7l18-28.8c3.9-6.2 10.7-10 18-10L47 90.6c-1.2 4.3 2.1 8.6 6.5 8.6h27.4v.3ZM133.5 40.9c0 2.1-.8 4-2.2 5.4-1.4 1.4-3.3 2.2-5.4 2.2H111.3c-3.8-.4-6.8-3.6-6.8-7.6 0-2.1.9-4 2.2-5.4 1.4-1.4 3.3-2.2 5.4-2.2h3.3l2.7-9.9h.1l12.7 11.7c1.6 1.4 2.6 3.5 2.6 5.8ZM112.6 48.5h-.8.8ZM129.9 56.2c0 2.1-.8 4-2.2 5.4-1.4 1.4-3.3 2.2-5.4 2.2H107.7c-.1 0-.3 0-.5-.1-3.6-.6-6.3-3.8-6.3-7.5 0-2.1.9-4 2.2-5.4 1.4-1.4 3.3-2.2 5.4-2.2H125.3l2 1.8c1.6 1.4 2.6 3.5 2.6 5.8ZM112.6 48.5h-.8.8Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M125.7 71.4c0 2.1-.9 4-2.2 5.4-1.4 1.4-3.3 2.2-5.4 2.2h-13.8c-.3 0-.6 0-.8-.1-.1 0-.3 0-.5-.1-3.6-.6-6.3-3.8-6.3-7.5 0-2.1.9-4 2.2-5.4 1.4-1.4 3.3-2.2 5.4-2.2H121.1l2 1.8c1.6 1.5 2.6 3.6 2.6 5.9ZM117.1 84.8c0 1.6-.6 3-1.7 4.1-1.1 1.1-2.5 1.7-4.1 1.7h-11c-.2 0-.4-.1-.5-.1-2.6-.5-4.6-2.8-4.6-5.6 0-1.6.6-3 1.7-4.1 1.1-1 2.5-1.7 4.1-1.7h2.5V79c.3 0 .6.1.8.1h9.3l1.5 1.4c1.2.9 2 2.5 2 4.3ZM89.7 14.8h11"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M75.4 89.3a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M115.4 33.3h4.2"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconMail = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 177 111"
    >
      <path
        className="icon-hover-color-stroke"
        d="M153.7 2.9H23.8C12.5 2.9 3.4 12 3.4 23.3v84.6h150.3V2.9Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M153.7 2.9c11.3 0 20.4 9.1 20.4 20.4h-20.4V2.9ZM3.4 40.8l75.1 40.3M153.7 40.8 78.5 81.1M113.8 75.3h27M113.8 85.3h27M113.8 95.3h27"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M51.5 51.8c3.2-.4 6.3-.9 9.5-1.3l33-4.2c.2 0 .4-.1.6-.2V23.8l-6.9-.9c-10.1-1.3-20.2-2.5-30.4-3.8-2.1-.3-4.2-.6-6.2-.9h54.6v33.5c-18 .1-36.1.1-54.2.1Z"
        fill={color}
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M54.9 24.2c1.8.1 3.5.3 5.4.4v12.6c0 2.7.5 3.6 2.2 3.6 1.9 0 2.6-1 2.6-3.6V25c1.5.1 2.8.2 4.3.3v12.4c-.1 6.3-6.1 9.9-11.8 7.2-1.7-.8-2.7-2.2-2.7-3.9-.1-5.6 0-11.1 0-16.8ZM81.6 30.5c-1.3-.1-2.5-.1-3.7-.2V26c4.2.4 8.3.7 12.5 1.1v3.6h-3.6v12.5c-1.8.1-3.4.3-5.2.4V30.5ZM71.3 44.4V31.6h5V44c-1.6.2-3.2.3-5 .4ZM76.4 30.2c-1.8-.1-3.4-.2-5-.2v-4.4c1.5.1 3 .2 4.4.3.2 0 .6.4.6.6v3.7Z"
        fill={color}
      />
    </svg>
  );
};

const IconVideo = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 163 135"
    >
      <path
        d="M160 107.8H3.1V3H160v104.8Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M94.7 48.4 81.5 56l-13.1 7.5V33.2l13.1 7.6 13.2 7.6Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M81.5 132c13.365 0 24.2-10.835 24.2-24.2 0-13.365-10.835-24.2-24.2-24.2-13.365 0-24.2 10.835-24.2 24.2 0 13.365 10.835 24.2 24.2 24.2Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M93.4 107.8H69.7M81.5 119.6V96"
        stroke="#fff"
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconCalendarMultiple = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 164 121"
    >
      <path
        d="M160.7 12.8H3.2v105h157.5v-105Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M148 24.7H15.7v11.5H148V24.7ZM40.4 47.9H15.7v11.5h24.7V47.9Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M76.3 47.9H51.6v11.5h24.7V47.9Z"
        className="icon-hover-color-stroke icon-hover-color-fill"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M112.2 47.9H87.5v11.5h24.7V47.9ZM148 47.9h-24.7v11.5H148V47.9ZM40.4 71.2H15.7v11.5h24.7V71.2Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M76.3 71.2H51.6v11.5h24.7V71.2Z"
        className="icon-hover-color-stroke icon-hover-color-fill"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M112.2 71.2H87.5v11.5h24.7V71.2ZM148 71.2h-24.7v11.5H148V71.2ZM40.4 94.5H15.7V106h24.7V94.5Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M76.3 94.5H51.6V106h24.7V94.5Z"
        className="icon-hover-color-stroke icon-hover-color-fill"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M112.2 94.5H87.5V106h24.7V94.5ZM148 94.5h-24.7V106H148V94.5ZM41.9 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9c0-3.5-2.9-6.3-6.4-6.3ZM81.9 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9c0-3.5-2.9-6.3-6.4-6.3ZM121.9 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9c0-3.5-2.9-6.3-6.4-6.3Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconCalendarSingle = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 163 121"
    >
      <path
        d="M160.4 12.9H2.9v105h157.5v-105Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M147.7 24.8H15.4v11.5h132.3V24.8ZM40.1 48.1H15.4v11.5h24.7V48.1ZM76 48.1H51.3v11.5H76V48.1ZM111.8 48.1H87.1v11.5h24.7V48.1ZM147.7 48.1H123v11.5h24.7V48.1ZM40.1 71.4H15.4v11.5h24.7V71.4Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M76 71.4H51.3v11.5H76V71.4Z"
        fill={color}
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M111.8 71.4H87.1v11.5h24.7V71.4ZM147.7 71.4H123v11.5h24.7V71.4ZM40.1 94.6H15.4v11.5h24.7V94.6ZM76 94.6H51.3v11.5H76V94.6ZM111.8 94.6H87.1v11.5h24.7V94.6ZM147.7 94.6H123v11.5h24.7V94.6ZM41.6 2.8c-3.5 0-6.4 2.9-6.4 6.4V13H48V9.2c0-3.5-2.9-6.4-6.4-6.4ZM81.6 2.8c-3.5 0-6.4 2.9-6.4 6.4V13H88V9.2c0-3.5-2.9-6.4-6.4-6.4ZM121.6 2.8c-3.5 0-6.4 2.9-6.4 6.4V13H128V9.2c0-3.5-2.9-6.4-6.4-6.4Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconLocation = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 163 146"
    >
      <path
        d="m160.186 37.355-157.3.29.03 16.3 157.3-.29-.03-16.3Z"
        className="icon-hover-color-stroke"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m56.6 37.5-31.4.1 40.4-24.7 15.7-9.5L97 12.9l40.5 24.5h-31.4l-49.5.1Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M72.8 37.5H62.1l13.8-8.4 5.4-3.3 5.3 3.3 13.8 8.3-10.7.1H72.8ZM28.22 53.886l-16.3.03.162 88.8 16.3-.03-.162-88.8ZM52.686 126.279l-24.3.044.03 16.299 24.3-.043-.03-16.3ZM94.386 126.178l-25.4.046.03 16.3 25.4-.046-.03-16.3ZM134.987 126.179l-24.3.044.029 16.3 24.3-.044-.029-16.3Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m68.82 53.786-16.3.03.162 88.799 16.3-.029-.162-88.8ZM151.121 53.686l-16.3.03.161 88.8 16.3-.03-.161-88.8ZM110.521 53.686l-16.3.03.16 88.8 16.301-.03-.161-88.8ZM94.3 114.8H68.9M134.9 114.7l-24.3.1M52.6 114.9H28.3M12.1 142.7H2.9l9.1-20.4.1 20.4ZM151.3 142.4h9l-9-20.4v20.4Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconOnline = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 90 74"
    >
      <path
        className="icon-hover-color-stroke"
        d="M88.087 1.573H1.913v57.45h86.174V1.572Z"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M76.105 13.446H13.95V47.04h62.155V13.446ZM13.95 21.215h62.1"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M18.6 17.33a.11.11 0 1 0 0-.218.11.11 0 0 0 0 .218Z"
        fill="#fff"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M24.072 17.33a.11.11 0 1 0 0-.218.11.11 0 0 0 0 .218ZM29.543 17.33a.11.11 0 1 0 0-.218.11.11 0 0 0 0 .218Z"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="M49.623 26.851h-9.301v9.301h9.301v-9.301Z"
        fill={color}
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45.137 31.666h-.383c-1.094 0-1.97.875-1.97 1.97h4.322c0-1.095-.875-1.97-1.97-1.97ZM44.918 29.587a.438.438 0 1 0 0-.876.438.438 0 0 0 0 .876Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M25.878 41.623h44.865"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        d="m21.063 41.623-.93.547-.876.493v-2.08l.876.548.93.492Z"
        fill={color}
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m49.897 59.022 4.267 13.405H36.71l4.269-13.405h8.918ZM29.544 72.427h30.912"
        stroke={color}
        strokeWidth="2.736"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconCalendar = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 163 121"
    >
      <path
        className="icon-hover-color-stroke"
        d="M160.5 12.8H3v105h157.5v-105Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M147.8 24.7H15.5v11.5h132.3V24.7ZM40.2 48H15.5v11.5h24.7V48ZM76.1 48H51.4v11.5h24.7V48ZM112 48H87.3v11.5H112V48ZM147.8 48h-24.7v11.5h24.7V48ZM40.2 71.2H15.5v11.5h24.7V71.2ZM76.1 71.2H51.4v11.5h24.7V71.2ZM112 71.2H87.3v11.5H112V71.2ZM147.8 71.2h-24.7v11.5h24.7V71.2ZM40.2 94.5H15.5V106h24.7V94.5ZM76.1 94.5H51.4V106h24.7V94.5ZM112 94.5H87.3V106H112V94.5ZM147.8 94.5h-24.7V106h24.7V94.5ZM41.7 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9.1c0-3.5-2.9-6.4-6.4-6.4ZM81.7 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9.1c0-3.5-2.9-6.4-6.4-6.4ZM121.7 2.7c-3.5 0-6.4 2.9-6.4 6.4v3.8h12.8V9.1c0-3.5-2.9-6.4-6.4-6.4Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconBuilding = ({ color, width, height }: IconProps) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 163 146"
    >
      <path
        className="icon-hover-color-stroke"
        d="m160.186 37.355-157.3.29.03 16.3 157.3-.29-.03-16.3Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m56.6 37.5-31.4.1 40.4-24.7 15.7-9.5L97 12.9l40.5 24.5h-31.4l-49.5.1Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="M72.8 37.5H62.1l13.8-8.4 5.4-3.3 5.3 3.3 13.8 8.3-10.7.1H72.8ZM28.22 53.886l-16.3.03.162 88.8 16.3-.03-.162-88.8ZM52.686 126.279l-24.3.044.03 16.299 24.3-.043-.03-16.3ZM94.386 126.178l-25.4.046.03 16.3 25.4-.046-.03-16.3ZM134.987 126.179l-24.3.044.029 16.3 24.3-.044-.029-16.3Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="icon-hover-color-stroke"
        d="m68.82 53.786-16.3.03.162 88.799 16.3-.029-.162-88.8ZM151.121 53.686l-16.3.03.161 88.8 16.3-.03-.161-88.8ZM110.521 53.686l-16.3.03.16 88.8 16.301-.03-.161-88.8ZM94.3 114.8H68.9M134.9 114.7l-24.3.1M52.6 114.9H28.3M12.1 142.7H2.9l9.1-20.4.1 20.4ZM151.3 142.4h9l-9-20.4v20.4Z"
        stroke={color}
        strokeWidth="5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const IconCultuurkuurCalendar = ({ color, width, height }) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 591.674 586.835"
    >
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        stroke={color}
        strokeWidth="1"
        strokeMiterlimit="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M349.5 1.06c-2.7.5-8.4 1.3-12.5 1.7-40.1 4.6-81.8 23.7-106.4 48.8-12.6 12.8-20.2 25.8-25 42.4-2.2 7.5-2.2 26.3 0 33.8 10.4 36.1 38.8 62.3 87.4 80.6 10.7 4 37.3 10.5 43.4 10.5 3.5.1 24.5 3.5 24.9 4.1.3.4 4.5 7 12.2 18.9 2.2 3.6 5.4 8.5 7 11 1.7 2.5 3.4 5.3 4 6.3.5.9 4.4 6.9 8.4 13.3 5.5 8.5 8.4 12 10.8 13.2 4 1.9 7.7.9 10.5-2.9 1.7-2.3 6.2-20.2 8.8-34.9 1.8-10.1 6.3-29.6 7.1-30.6.5-.6 3.9-1.9 7.6-2.9 6-1.5 18.8-5.8 30.5-10.1 6.8-2.5 24.6-12.1 32.4-17.6 10.4-7.1 24.9-21.6 31-30.8 15.9-24 18.7-50.4 7.8-75.1-1.5-3.5-3.3-7.1-3.9-7.9-.6-.8-1.7-2.8-2.5-4.4-2.1-4.1-12.6-16.1-20.1-23-9-8.2-23.2-17.3-38-24.5-7-3.4-13.2-6.1-13.9-6.1-.7 0-2.6-.6-4.3-1.3-5.4-2.3-12.8-4.4-22.7-6.7-5.2-1.2-10.9-2.5-12.6-3.1-1.7-.5-4.8-.9-7-.9-2.1 0-7.5-.7-11.9-1.5-9.1-1.6-44.7-1.9-53-.3zm52.5 18.8c60.9 7.7 105.5 33 120.9 68.5 5.8 13.4 5.8 31.8 0 45-9.9 22.3-33.4 42.2-64.6 54.6-12.9 5.1-24.4 8.6-34.3 10.3-1.9.3-4.9 1.5-6.7 2.5-3.3 2.1-4.9 6-7.2 18.1-.6 3-2 9.5-3 14.5-1.1 4.9-2.2 10.7-2.6 12.7-.9 5.4-3.6 5.1-7.1-1-1.5-2.6-6.5-10.5-11.1-17.5s-8.3-13.1-8.3-13.5c0-.4-1.8-2.8-4-5.4-3.7-4.3-4.5-4.7-9.8-5.3-3.1-.3-10.2-1-15.7-1.6-64.3-6.9-113.4-37.2-124.4-77-7.4-26.7 7-55.3 38.4-76.3 8-5.4 21.3-12 31-15.5 5-1.8 10.6-3.9 12.5-4.6 8.7-3.2 28.1-6.9 43.5-8.5 6.6-.6 12.7-1.3 13.5-1.5 2.6-.7 30.2.4 39 1.5z"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        stroke={color}
        strokeWidth="1"
        strokeMiterlimit="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M316.3 65.56c-.9.3-1.3 3-1.3 8.3 0 6.8.3 8.1 1.9 9 1.2.6 10.1 1 22.1 1h20l1-2.6c1.4-3.6 1.2-13.8-.2-15.2-.9-.9-7-1.2-21.7-1.1-11.4 0-21.2.3-21.8.6zm65 0c-1.7.6-1.8 15.4-.1 17.1 1.2 1.2 10.6 1.6 14.6.6 2.1-.6 2.2-1.2 2.2-8.9 0-6.6-.3-8.4-1.6-8.9-1.8-.7-13.3-.7-15.1.1zm35.7.8c-1.7 2.1-.9 15.3 1 16.5 2.1 1.4 42.7 1.3 43.5-.1 1-1.6 1.2-14.2.3-16.2-.8-1.5-2.9-1.7-22.2-1.7-17.7 0-21.6.3-22.6 1.5zm-129.6 36.8c-.3.8-.4 4.7-.2 8.8l.3 7.4h110v-17l-54.8-.3c-45.3-.2-54.8 0-55.3 1.1zm129.2.3c-.3.9-.6 4.2-.6 7.4 0 9.7-1.8 9 23.5 9h22.3l.4-6.3c.1-3.4.2-7.4 0-9l-.3-2.7h-22.4c-19.4 0-22.4.2-22.9 1.6zm-128.9 36c-.4.4-.7 4.2-.7 8.5 0 7.3.2 7.9 2.3 8.4 1.2.3 9.4.4 18.2.3l16-.3v-17l-17.6-.3c-9.6-.1-17.8.1-18.2.4zm54.9 1c-1.2 3.1-.6 14.1.8 15.3.9.8 15.1 1 50.7.9l49.4-.3.3-8.8.3-8.7h-50.5c-45 0-50.5.2-51 1.6zm-165.1-80.3c-18.4 9.5-26 14.8-38.2 26.8-10 9.8-18.2 21.9-23.2 34.3-2.4 5.9-5.1 19.9-5.1 26.4 0 21.6 9.9 43.1 28.1 61 8.6 8.4 10.7 10 21.9 17.4 9 5.9 9.7 6.3 16.5 9.7 8.4 4 8.7 4.5 7.1 11.2-.7 2.9-2.1 9-3.1 13.4-.9 4.4-2.6 11.6-3.6 15.9-1 4.4-1.9 9.3-1.9 10.9 0 4 4.8 8.7 9 8.7 3 0 14-6.5 39-22.9 9.7-6.3 11.9-7.7 14-8.8.8-.4 3.4-2 5.8-3.6s5.3-2.9 6.5-2.9c1.2-.1 11 .3 21.7.7 27.8 1 50.1-1.1 73.1-7.1 5.9-1.6 8.1-10.9 3.6-15.2-2.8-2.6-9.2-2.9-17-.8-15.9 4.2-43.3 6.1-65.7 4.4-9.1-.6-17.7-1.2-19.2-1.1-2.3 0-9 3.6-19.2 10.3-1.3.8-5.4 3.4-9.2 5.8-3.8 2.4-9.1 5.7-11.7 7.4-6.4 4-7.2 3.1-5.1-6.3 4.6-20.7 4.9-23.3 3-26.1-.9-1.4-2.6-3-3.9-3.6-1.2-.6-6.9-3.3-12.7-6.1-15.8-7.5-25.3-14.2-36.5-25.5-8.3-8.3-10.8-11.7-14.4-18.8-5.2-10.5-7-17.9-7-27.8 0-27.6 19.3-52.4 55.4-71.1 5.2-2.7 10.1-4.9 10.9-4.9 2.1 0 7.6-6.8 7.6-9.5 0-1.3-1.2-3.7-2.6-5.4-4.2-5-9.2-4.3-23.9 3.2zM110 308.26c-11.3 4-17.2 7.7-25.6 16-8.4 8.4-13 15.8-17 27.6-2.7 7.8-2.6 28.2 0 36 4.3 12.4 7.9 18.2 18 29.4 2 2.2 3.3 4.3 2.9 4.6-.5.4-3 1.5-5.8 2.4-25.8 9-43.1 20.6-55.1 37.1-5.3 7.3-10.5 17.3-13.1 25.4-1.5 4.8-6.8 28.8-8.2 37.6-.5 2.7-2 10.7-3.5 17.7-1.4 7-2.6 13.4-2.6 14.2 0 .8 1.1 2.8 2.5 4.4 3.5 4.2 28 12.4 54.5 18.2 5.2 1.1 11.1 2.3 13 2.6 1.9.3 7.6 1.1 12.5 1.9 22.5 3.5 48.4 4.4 72 2.5 20.1-1.7 46.5-6 61-10.1 3.9-1.1 8.6-2.4 10.5-2.9 5.8-1.3 21.5-6.8 26.3-9 7.2-3.4 8.1-8.4 4.2-24-1.6-6.5-6.5-30.6-7.5-37-3.6-23.5-16.4-45.3-34.9-59.5-7.1-5.5-7.1-5.5-17.8-10.9-12.2-6.1-12.4-6.2-19-8.1-3.5-1.1-6.3-2.3-6.3-2.8s2.7-3.9 6-7.5c9.5-10.6 15.4-23.9 17.5-39.8.9-6.7-1.7-20.7-5.5-29.6-2.8-6.7-10.2-18-13.7-20.8-12.2-10-15.8-12.1-27.5-16.1-8.6-2.9-28.8-2.6-37.8.5zm32.7 17.6c7 2.2 9.2 3.3 14.8 7.5 7.5 5.7 11.9 11.5 15.2 20.5 7.3 19.5.7 41.1-16.2 53.6-5.5 4.1-9.8 5.9-18.8 7.9-7.1 1.6-8.2 1.6-15.7.1-4.5-1-10.9-3.1-14.2-4.8-8.4-4.5-16.8-13.9-20.7-23.3-2.7-6.5-3.1-8.5-3.1-17.2 0-11 1.6-16.7 7.4-25.7 10.6-16.5 32.5-24.5 51.3-18.6zm6.8 111c16.9 3 25.3 5.6 37.5 11.5 11.4 5.6 17.2 9.8 24.8 18.1 10.1 10.9 16.5 24.7 19.3 41.4.4 2.5 2.3 12.4 4.2 22 3.4 16.4 3.5 17.6 1.9 19.1-3 2.9-28.1 10-47.2 13.4-5.2.9-11.7 2.1-14.5 2.6-17 3.4-69.6 3.6-89.1.4-22-3.6-34-6.2-48.9-10.6-15.7-4.7-16.5-5.2-16.5-9.8 0-2.2.5-5.2 1.1-6.8.6-1.5 1.5-5.3 1.9-8.3 1.5-10.3 6.9-34.5 8.9-39.9 7.2-19.3 23.1-35.1 44.1-43.6 13.6-5.6 20.4-7.6 33-9.5 4.1-.7 8-1.4 8.5-1.5 3.4-1.1 21.6-.2 31 1.5zm298.1-130.3c-.4.4-3.1 1.5-6.2 2.4-13.7 4.3-29.7 18-36.1 31.1-5.3 10.9-6.7 17-6.7 29.8 0 14 1.7 20.6 9 34.2.8 1.5 4.4 5.9 8 9.9 3.6 3.9 6.2 7.5 5.7 7.9-.4.4-3.7 1.7-7.3 2.9-8.6 2.9-23 9.8-30.5 14.6-12.2 7.7-27.3 25.7-33.1 39.3-3.1 7.4-5.7 17.7-9.9 39.2-.9 4.7-2.4 11.9-3.2 16-.8 4.1-2.1 10.5-3 14.2-.8 3.6-1.2 7.7-.8 9 .9 2.9 4.4 6.8 6.1 6.8.8 0 2.8.6 4.6 1.4 5.2 2.2 10.8 4.2 17.3 6.1 3.3 1 7.8 2.3 10 3 4.3 1.4 19.5 4.8 28.5 6.4 18.2 3.2 25.1 4.1 39.6 5.2 14.6 1.1 33.1.9 54.9-.6 13.3-1 46.9-7.2 59.5-11 26-8 31.6-10 35.3-12.9 3.7-2.9 3.3-8-2.8-36.6-.8-3.6-2.1-10.3-3-15-4.1-21.4-8.4-33.5-16.1-45.2-4.9-7.3-14.8-17.4-23.4-23.8-6.3-4.8-22.5-12.9-32-16.1-3.6-1.2-6.9-2.5-7.4-2.9-.4-.5 2.1-4.2 5.7-8.3 11.3-13 16.8-26.6 17.1-42.2.1-10.4-1.8-19.1-6.5-29.1-8.1-17.1-20.5-27.9-39.6-34.3-5.1-1.7-8.7-2.1-19.6-2.1-7.4 0-13.7.3-14.1.7zm27.9 19.2c8.8 2.8 12 4.7 18.9 11.1 11.7 11 17 27.6 13.5 42.7-5.5 24.2-29.8 40.7-53 35.9-10.9-2.3-18.7-6.5-25.5-13.9-20.4-22-15.5-56.2 10.1-71.3 10.9-6.3 24.7-8.1 36-4.5zm2 110.1c3.3.6 8.5 1.5 11.6 2 14.7 2.6 36.3 11.8 47.1 20.3 3.2 2.5 8 7.1 10.8 10.3 5.2 6.1 12.5 19.5 14.2 26.1 1.3 5.4 4.7 21.8 5.7 28.4.5 3.2 1.4 6.6 2 7.7.6 1.2 1.1 3.4 1.1 5.1 0 1.7.5 5.1 1.2 7.6 1.1 4 1 4.6-.7 5.8-3.9 2.9-29.8 10.1-47.5 13.2-5.2.9-11.7 2.1-14.5 2.6-17.1 3.4-69.6 3.6-89.1.4-12-2-24.5-4.3-29.9-5.7-2.2-.5-5.8-1.3-8-1.8-5.4-1.1-22.9-6.6-25.4-8-2.3-1.2-2.8-5.3-1.1-10.4.5-1.7 1.9-8.3 3-14.6 5.7-31 9-40.8 18.4-53.9 10.6-14.9 36.8-29 61.6-33.2 3.6-.6 8.3-1.5 10.5-1.9 6.1-1.1 22.3-1.1 29 0z"
      />
    </svg>
  );
};

const IconCultuurkuurLocation = ({ color, width, height }) => {
  return (
    <svg
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 591.674 586.835"
    >
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        stroke={color}
        strokeWidth="1"
        strokeMiterlimit="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M349.5 1.06c-2.7.5-8.4 1.3-12.5 1.7-40.1 4.6-81.8 23.7-106.4 48.8-12.6 12.8-20.2 25.8-25 42.4-2.2 7.5-2.2 26.3 0 33.8 10.4 36.1 38.8 62.3 87.4 80.6 10.7 4 37.3 10.5 43.4 10.5 3.5.1 24.5 3.5 24.9 4.1.3.4 4.5 7 12.2 18.9 2.2 3.6 5.4 8.5 7 11 1.7 2.5 3.4 5.3 4 6.3.5.9 4.4 6.9 8.4 13.3 5.5 8.5 8.4 12 10.8 13.2 4 1.9 7.7.9 10.5-2.9 1.7-2.3 6.2-20.2 8.8-34.9 1.8-10.1 6.3-29.6 7.1-30.6.5-.6 3.9-1.9 7.6-2.9 6-1.5 18.8-5.8 30.5-10.1 6.8-2.5 24.6-12.1 32.4-17.6 10.4-7.1 24.9-21.6 31-30.8 15.9-24 18.7-50.4 7.8-75.1-1.5-3.5-3.3-7.1-3.9-7.9-.6-.8-1.7-2.8-2.5-4.4-2.1-4.1-12.6-16.1-20.1-23-9-8.2-23.2-17.3-38-24.5-7-3.4-13.2-6.1-13.9-6.1-.7 0-2.6-.6-4.3-1.3-5.4-2.3-12.8-4.4-22.7-6.7-5.2-1.2-10.9-2.5-12.6-3.1-1.7-.5-4.8-.9-7-.9-2.1 0-7.5-.7-11.9-1.5-9.1-1.6-44.7-1.9-53-.3zm52.5 18.8c60.9 7.7 105.5 33 120.9 68.5 5.8 13.4 5.8 31.8 0 45-9.9 22.3-33.4 42.2-64.6 54.6-12.9 5.1-24.4 8.6-34.3 10.3-1.9.3-4.9 1.5-6.7 2.5-3.3 2.1-4.9 6-7.2 18.1-.6 3-2 9.5-3 14.5-1.1 4.9-2.2 10.7-2.6 12.7-.9 5.4-3.6 5.1-7.1-1-1.5-2.6-6.5-10.5-11.1-17.5s-8.3-13.1-8.3-13.5c0-.4-1.8-2.8-4-5.4-3.7-4.3-4.5-4.7-9.8-5.3-3.1-.3-10.2-1-15.7-1.6-64.3-6.9-113.4-37.2-124.4-77-7.4-26.7 7-55.3 38.4-76.3 8-5.4 21.3-12 31-15.5 5-1.8 10.6-3.9 12.5-4.6 8.7-3.2 28.1-6.9 43.5-8.5 6.6-.6 12.7-1.3 13.5-1.5 2.6-.7 30.2.4 39 1.5z"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        stroke={color}
        strokeWidth="1"
        strokeMiterlimit="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M384.739 150.777a.15.15 0 0 0-.046.034 5.05 5.05 0 0 0-.323.398c.1-.073.147-.103.257-.183.112-.186.14-.258.112-.249zM177.5 60.16c-18.4 9.5-26 14.8-38.2 26.8-10 9.8-18.2 21.9-23.2 34.3-2.4 5.9-5.1 19.9-5.1 26.4 0 21.6 9.9 43.1 28.1 61 8.6 8.4 10.7 10 21.9 17.4 9 5.9 9.7 6.3 16.5 9.7 8.4 4 8.7 4.5 7.1 11.2-.7 2.9-2.1 9-3.1 13.4-.9 4.4-2.6 11.6-3.6 15.9-1 4.4-1.9 9.3-1.9 10.9 0 4 4.8 8.7 9 8.7 3 0 14-6.5 39-22.9 9.7-6.3 11.9-7.7 14-8.8.8-.4 3.4-2 5.8-3.6s5.3-2.9 6.5-2.9c1.2-.1 11 .3 21.7.7 27.8 1 50.1-1.1 73.1-7.1 5.9-1.6 8.1-10.9 3.6-15.2-2.8-2.6-9.2-2.9-17-.8-15.9 4.2-43.3 6.1-65.7 4.4-9.1-.6-17.7-1.2-19.2-1.1-2.3 0-9 3.6-19.2 10.3-1.3.8-5.4 3.4-9.2 5.8-3.8 2.4-9.1 5.7-11.7 7.4-6.4 4-7.2 3.1-5.1-6.3 4.6-20.7 4.9-23.3 3-26.1-.9-1.4-2.6-3-3.9-3.6-1.2-.6-6.9-3.3-12.7-6.1-15.8-7.5-25.3-14.2-36.5-25.5-8.3-8.3-10.8-11.7-14.4-18.8-5.2-10.5-7-17.9-7-27.8 0-27.6 19.3-52.4 55.4-71.1 5.2-2.7 10.1-4.9 10.9-4.9 2.1 0 7.6-6.8 7.6-9.5 0-1.3-1.2-3.7-2.6-5.4-4.2-5-9.2-4.3-23.9 3.2zM110 308.26c-11.3 4-17.2 7.7-25.6 16-8.4 8.4-13 15.8-17 27.6-2.7 7.8-2.6 28.2 0 36 4.3 12.4 7.9 18.2 18 29.4 2 2.2 3.3 4.3 2.9 4.6-.5.4-3 1.5-5.8 2.4-25.8 9-43.1 20.6-55.1 37.1-5.3 7.3-10.5 17.3-13.1 25.4-1.5 4.8-6.8 28.8-8.2 37.6-.5 2.7-2 10.7-3.5 17.7-1.4 7-2.6 13.4-2.6 14.2 0 .8 1.1 2.8 2.5 4.4 3.5 4.2 28 12.4 54.5 18.2 5.2 1.1 11.1 2.3 13 2.6 1.9.3 7.6 1.1 12.5 1.9 22.5 3.5 48.4 4.4 72 2.5 20.1-1.7 46.5-6 61-10.1 3.9-1.1 8.6-2.4 10.5-2.9 5.8-1.3 21.5-6.8 26.3-9 7.2-3.4 8.1-8.4 4.2-24-1.6-6.5-6.5-30.6-7.5-37-3.6-23.5-16.4-45.3-34.9-59.5-7.1-5.5-7.1-5.5-17.8-10.9-12.2-6.1-12.4-6.2-19-8.1-3.5-1.1-6.3-2.3-6.3-2.8s2.7-3.9 6-7.5c9.5-10.6 15.4-23.9 17.5-39.8.9-6.7-1.7-20.7-5.5-29.6-2.8-6.7-10.2-18-13.7-20.8-12.2-10-15.8-12.1-27.5-16.1-8.6-2.9-28.8-2.6-37.8.5zm32.7 17.6c7 2.2 9.2 3.3 14.8 7.5 7.5 5.7 11.9 11.5 15.2 20.5 7.3 19.5.7 41.1-16.2 53.6-5.5 4.1-9.8 5.9-18.8 7.9-7.1 1.6-8.2 1.6-15.7.1-4.5-1-10.9-3.1-14.2-4.8-8.4-4.5-16.8-13.9-20.7-23.3-2.7-6.5-3.1-8.5-3.1-17.2 0-11 1.6-16.7 7.4-25.7 10.6-16.5 32.5-24.5 51.3-18.6zm6.8 111c16.9 3 25.3 5.6 37.5 11.5 11.4 5.6 17.2 9.8 24.8 18.1 10.1 10.9 16.5 24.7 19.3 41.4.4 2.5 2.3 12.4 4.2 22 3.4 16.4 3.5 17.6 1.9 19.1-3 2.9-28.1 10-47.2 13.4-5.2.9-11.7 2.1-14.5 2.6-17 3.4-69.6 3.6-89.1.4-22-3.6-34-6.2-48.9-10.6-15.7-4.7-16.5-5.2-16.5-9.8 0-2.2.5-5.2 1.1-6.8.6-1.5 1.5-5.3 1.9-8.3 1.5-10.3 6.9-34.5 8.9-39.9 7.2-19.3 23.1-35.1 44.1-43.6 13.6-5.6 20.4-7.6 33-9.5 4.1-.7 8-1.4 8.5-1.5 3.4-1.1 21.6-.2 31 1.5zm298.1-130.3c-.4.4-3.1 1.5-6.2 2.4-13.7 4.3-29.7 18-36.1 31.1-5.3 10.9-6.7 17-6.7 29.8 0 14 1.7 20.6 9 34.2.8 1.5 4.4 5.9 8 9.9 3.6 3.9 6.2 7.5 5.7 7.9-.4.4-3.7 1.7-7.3 2.9-8.6 2.9-23 9.8-30.5 14.6-12.2 7.7-27.3 25.7-33.1 39.3-3.1 7.4-5.7 17.7-9.9 39.2-.9 4.7-2.4 11.9-3.2 16-.8 4.1-2.1 10.5-3 14.2-.8 3.6-1.2 7.7-.8 9 .9 2.9 4.4 6.8 6.1 6.8.8 0 2.8.6 4.6 1.4 5.2 2.2 10.8 4.2 17.3 6.1 3.3 1 7.8 2.3 10 3 4.3 1.4 19.5 4.8 28.5 6.4 18.2 3.2 25.1 4.1 39.6 5.2 14.6 1.1 33.1.9 54.9-.6 13.3-1 46.9-7.2 59.5-11 26-8 31.6-10 35.3-12.9 3.7-2.9 3.3-8-2.8-36.6-.8-3.6-2.1-10.3-3-15-4.1-21.4-8.4-33.5-16.1-45.2-4.9-7.3-14.8-17.4-23.4-23.8-6.3-4.8-22.5-12.9-32-16.1-3.6-1.2-6.9-2.5-7.4-2.9-.4-.5 2.1-4.2 5.7-8.3 11.3-13 16.8-26.6 17.1-42.2.1-10.4-1.8-19.1-6.5-29.1-8.1-17.1-20.5-27.9-39.6-34.3-5.1-1.7-8.7-2.1-19.6-2.1-7.4 0-13.7.3-14.1.7zm27.9 19.2c8.8 2.8 12 4.7 18.9 11.1 11.7 11 17 27.6 13.5 42.7-5.5 24.2-29.8 40.7-53 35.9-10.9-2.3-18.7-6.5-25.5-13.9-20.4-22-15.5-56.2 10.1-71.3 10.9-6.3 24.7-8.1 36-4.5zm2 110.1c3.3.6 8.5 1.5 11.6 2 14.7 2.6 36.3 11.8 47.1 20.3 3.2 2.5 8 7.1 10.8 10.3 5.2 6.1 12.5 19.5 14.2 26.1 1.3 5.4 4.7 21.8 5.7 28.4.5 3.2 1.4 6.6 2 7.7.6 1.2 1.1 3.4 1.1 5.1 0 1.7.5 5.1 1.2 7.6 1.1 4 1 4.6-.7 5.8-3.9 2.9-29.8 10.1-47.5 13.2-5.2.9-11.7 2.1-14.5 2.6-17.1 3.4-69.6 3.6-89.1.4-12-2-24.5-4.3-29.9-5.7-2.2-.5-5.8-1.3-8-1.8-5.4-1.1-22.9-6.6-25.4-8-2.3-1.2-2.8-5.3-1.1-10.4.5-1.7 1.9-8.3 3-14.6 5.7-31 9-40.8 18.4-53.9 10.6-14.9 36.8-29 61.6-33.2 3.6-.6 8.3-1.5 10.5-1.9 6.1-1.1 22.3-1.1 29 0zM334.169 63.88c-27.971 7.736-41.778 36.242-29.578 61 14.343 29.042 54.752 33.981 84.032 10.236l5.118-4.107-5.118-5.713-5.059-5.713-5.713 4.523c-26.483 21.008-62.726 10.534-62.726-18.092 0-29.578 37.076-38.088 65.702-15.116l3.273 2.619 4.701-5.297c6.07-6.665 6.19-6.07-2.32-12.32-16.664-12.259-35.708-16.663-52.312-12.02zm102.719-.06c-.536.952-9.88 11.01-20.77 22.377l-19.818 20.71 15.057 16.068c8.272 8.808 17.377 18.568 20.174 21.722l5.118 5.595 5.714-5.059 5.772-5.118-16.068-17.02c-8.867-9.344-15.89-17.2-15.652-17.438.298-.297 7.975-8.094 17.14-17.318l16.663-16.842-5.356-4.642c-6.01-5.178-6.606-5.416-7.974-3.035z"
      />
      <path
        className="icon-hover-color-stroke icon-hover-color-fill"
        stroke={color}
        strokeWidth="1"
        strokeMiterlimit="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M327.503 92.564c-2.44 3.69-.892 8.213 3.63 10.237 6.488 2.975 12.2-6.309 7.142-11.427-2.975-2.916-8.51-2.32-10.772 1.19z"
      />
    </svg>
  );
};

const CustomIconVariants = {
  MAP: 'map',
  IMAGE: 'image',
  BADGE: 'badge',
  PHYSICAL: 'physical',
  PHONE: 'phone',
  MAIL: 'mail',
  VIDEO: 'video',
  CALENDAR: 'calendar',
  CALENDAR_MULTIPLE: 'calendarMultiple',
  CALENDAR_SINGLE: 'calendarSingle',
  LOCATION: 'location',
  ONLINE: 'online,',
  BUILDING: 'building',
  CULTUURKUUR_CALENDAR: 'cultuurkuurCalendar',
  CULTUURKUUR_LOCATION: 'cultuurkuurLocation',
} as const;

const IconsMap = {
  [CustomIconVariants.MAP]: IconMap,
  [CustomIconVariants.IMAGE]: IconImage,
  [CustomIconVariants.BADGE]: IconBadge,
  [CustomIconVariants.PHYSICAL]: IconPhysical,
  [CustomIconVariants.PHONE]: IconPhone,
  [CustomIconVariants.MAIL]: IconMail,
  [CustomIconVariants.VIDEO]: IconVideo,
  [CustomIconVariants.CALENDAR]: IconCalendar,
  [CustomIconVariants.CALENDAR_MULTIPLE]: IconCalendarMultiple,
  [CustomIconVariants.CALENDAR_SINGLE]: IconCalendarSingle,
  [CustomIconVariants.LOCATION]: IconLocation,
  [CustomIconVariants.ONLINE]: IconOnline,
  [CustomIconVariants.BUILDING]: IconBuilding,
  [CustomIconVariants.CULTUURKUUR_CALENDAR]: IconCultuurkuurCalendar,
  [CustomIconVariants.CULTUURKUUR_LOCATION]: IconCultuurkuurLocation,
};

type Props = IconProps & {
  name: Values<typeof CustomIconVariants>;
} & StackProps;

const CustomIcon = ({ name, color, width, height, ...props }: Props) => {
  const Component = IconsMap[name];
  return (
    <Stack {...getStackProps(props)}>
      <Component color={color} width={width} height={height} />
    </Stack>
  );
};

export { CustomIcon, CustomIconVariants };
