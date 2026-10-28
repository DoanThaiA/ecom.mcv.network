interface ThumbUpIconProps {
  selected?: boolean;
  className?: string;
}

export function ThumbUpIcon({ selected = false, className }: ThumbUpIconProps) {
  return (
    <svg
      width="83"
      height="56"
      viewBox="0 0 83 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="0.268555"
        y="0.268555"
        width="82.1855"
        height="55.463"
        rx="7.73"
        fill={selected ? 'url(#thumb-up-gradient-bg)' : 'white'}
        stroke={selected ? 'none' : '#E2E2E2'}
        strokeWidth="0.537223"
      />
      <g transform="translate(37, 16)">
        <path
          d="M13.103 7.04315C14.9618 7.37623 16.1974 10.0087 16.4338 11.6848C16.5627 12.5551 15.9503 16.3801 15.6709 17.2719C15.456 17.9595 14.2526 19.2167 13.7691 20.3019C13.5327 20.8284 13.1352 21.2583 12.598 21.4732C12.4905 21.5161 12.3938 21.5482 12.3079 21.5697C10.8359 21.9135 4.1206 21.9674 2.57339 21.7095C1.83203 21.5806 0.295568 20.7101 0.15589 19.9688C-0.0589989 18.8191 -0.0482439 11.2551 0.166645 10.0839C0.446001 8.60118 2.51967 6.22675 2.87424 4.80848C3.29327 3.13235 2.3585 1.32714 4.18506 0.370884C7.92414 -1.57386 8.55806 4.64713 8.12828 7.0324C9.6325 7.21505 11.6525 6.77453 13.0707 7.0324"
          fill={selected ? 'white' : 'black'}
        />
      </g>
      <g transform="translate(29, 24)">
        <path
          d="M0.89278 0.84447C2.2036 -0.595288 5.44843 -0.154555 6.21129 1.8654C6.73776 3.27293 6.74852 9.74097 6.51215 11.4064C5.98567 15.0702 0.989482 15.1347 0.291092 12.2552C-0.0849637 10.6865 -0.0527297 4.56214 0.140671 2.81079C0.205137 2.21985 0.495235 1.27425 0.89278 0.84447Z"
          fill={selected ? 'white' : 'black'}
        />
      </g>
      <defs>
        <linearGradient id="thumb-up-gradient-bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="-2.23%" stopColor="#FAA63E" />
          <stop offset="19.77%" stopColor="#EA9839" />
          <stop offset="62.77%" stopColor="#C0752F" />
          <stop offset="96.77%" stopColor="#9B5526" />
        </linearGradient>
      </defs>
    </svg>
  );
}
