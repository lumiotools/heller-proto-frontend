"use client";

interface CallButtonProps {
  aiState: "idle" | "speaking" | "listening" | "active";
}

export const CallButtonSvg = ({ aiState }: CallButtonProps) => (
  <div className="w-full h-full pointer-events-none">
    {aiState === "speaking" || aiState === "listening" ? (
      <svg
        width="249"
        height="282"
        viewBox="0 0 249 282"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g filter="url(#filter0_d_68_120)">
          <circle
            cx="124.752"
            cy="125.965"
            r="118.5"
            fill="white"
            stroke="url(#paint0_linear_68_120)"
            strokeWidth="3"
          />
          <circle
            cx="124.752"
            cy="125.965"
            r="102.5"
            fill="url(#paint1_linear_68_120)"
            stroke="url(#paint2_linear_68_120)"
            strokeWidth="3"
          />
          <g filter="url(#filter1_d_68_120)">
            <circle cx="124.752" cy="125.965" r="76" fill="white" />
            <circle
              cx="124.752"
              cy="125.965"
              r="74.5"
              stroke="url(#paint3_linear_68_120)"
              strokeWidth="3"
            />
          </g>
          <ellipse
            cx="98.7145"
            cy="125.143"
            rx="5.7143"
            ry="5.71428"
            fill="#8AC6E2"
          />
          <ellipse
            cx="123.857"
            cy="124.857"
            rx="5.7143"
            ry="5.71428"
            fill="#8AC6E2"
          />
          <ellipse
            cx="149"
            cy="124.857"
            rx="5.7143"
            ry="5.71428"
            fill="#8AC6E2"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_68_120"
            x="0.752197"
            y="0.964844"
            width="248"
            height="248"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_68_120"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_68_120"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_d_68_120"
            x="42.752"
            y="49.9648"
            width="164"
            height="168"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.00392157 0 0 0 0 0.101961 0 0 0 0 0.180392 0 0 0 0.18 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_68_120"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_68_120"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_68_120"
            x1="81.2522"
            y1="12.4648"
            x2="186.252"
            y2="227.965"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_68_120"
            x1="87.0522"
            y1="27.5982"
            x2="178.052"
            y2="214.365"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_68_120"
            x1="87.0522"
            y1="27.5982"
            x2="178.052"
            y2="214.365"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_68_120"
            x1="97.202"
            y1="54.0815"
            x2="163.702"
            y2="190.565"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0083BF" />
            <stop offset="1" stopColor="#0083BF" />
          </linearGradient>
        </defs>
      </svg>
    ) : (
      <svg
        width="249"
        height="281"
        viewBox="0 0 249 281"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g filter="url(#filter0_d_68_12)">
          <circle
            cx="124.752"
            cy="125"
            r="118.5"
            fill="white"
            stroke="url(#paint0_linear_68_12)"
            strokeWidth="3"
          />
          <circle
            cx="124.752"
            cy="125"
            r="102.5"
            fill="url(#paint1_linear_68_12)"
            stroke="url(#paint2_linear_68_12)"
            strokeWidth="3"
          />
          <g filter="url(#filter1_d_68_12)">
            <circle cx="124.752" cy="125" r="76" fill="white" />
            <circle
              cx="124.752"
              cy="125"
              r="74.5"
              stroke="url(#paint3_linear_68_12)"
              strokeWidth="3"
            />
          </g>
          <path
            d="M112.642 103.476C112.689 103.335 112.779 103.212 112.9 103.124C113.021 103.037 113.166 102.99 113.315 102.99C113.464 102.99 113.61 103.037 113.73 103.124C113.851 103.212 113.942 103.335 113.988 103.476L115.253 107.273C115.818 108.966 117.145 110.293 118.838 110.858L122.635 112.123C122.776 112.17 122.9 112.26 122.987 112.381C123.074 112.502 123.121 112.647 123.121 112.796C123.121 112.945 123.074 113.09 122.987 113.211C122.9 113.332 122.776 113.422 122.635 113.469L118.838 114.734C118.002 115.011 117.243 115.479 116.621 116.102C115.999 116.724 115.53 117.483 115.253 118.318L113.988 122.115C113.942 122.257 113.851 122.38 113.73 122.467C113.61 122.555 113.464 122.602 113.315 122.602C113.166 122.602 113.021 122.555 112.9 122.467C112.779 122.38 112.689 122.257 112.642 122.115L111.378 118.318C111.1 117.483 110.632 116.724 110.01 116.102C109.387 115.479 108.628 115.011 107.793 114.734L103.996 113.469C103.854 113.422 103.731 113.332 103.644 113.211C103.556 113.09 103.51 112.945 103.51 112.796C103.51 112.647 103.556 112.502 103.644 112.381C103.731 112.26 103.854 112.17 103.996 112.123L107.793 110.858C108.628 110.581 109.387 110.112 110.01 109.49C110.632 108.868 111.1 108.109 111.378 107.273L112.642 103.476Z"
            fill="#EBE9F0"
          />
          <path
            d="M135.742 100.048C135.774 99.9554 135.834 99.8747 135.915 99.8176C135.995 99.7605 136.091 99.7299 136.189 99.7299C136.288 99.7299 136.384 99.7605 136.464 99.8176C136.544 99.8747 136.605 99.9554 136.637 100.048L137.48 102.578C137.856 103.708 138.742 104.594 139.872 104.97L142.401 105.813C142.494 105.845 142.575 105.905 142.632 105.986C142.689 106.066 142.72 106.162 142.72 106.26C142.72 106.359 142.689 106.455 142.632 106.535C142.575 106.615 142.494 106.676 142.401 106.708L139.872 107.551C139.315 107.737 138.81 108.05 138.395 108.466C137.979 108.881 137.666 109.386 137.48 109.943L136.637 112.472C136.605 112.565 136.544 112.646 136.464 112.703C136.384 112.76 136.288 112.791 136.189 112.791C136.091 112.791 135.995 112.76 135.915 112.703C135.834 112.646 135.774 112.565 135.742 112.472L134.899 109.943C134.712 109.386 134.399 108.881 133.984 108.466C133.569 108.05 133.063 107.737 132.507 107.551L129.981 106.708C129.888 106.676 129.807 106.615 129.75 106.535C129.693 106.455 129.662 106.359 129.662 106.26C129.662 106.162 129.693 106.066 129.75 105.986C129.807 105.905 129.888 105.845 129.981 105.813L132.51 104.97C133.641 104.594 134.526 103.708 134.902 102.578L135.742 100.048Z"
            fill="url(#paint4_linear_68_12)"
          />
          <path
            d="M128.117 116.877C128.476 115.798 129.999 115.798 130.359 116.877L132.466 123.206C132.93 124.598 133.712 125.862 134.749 126.899C135.787 127.936 137.051 128.716 138.443 129.18L144.769 131.287C145.848 131.647 145.848 133.17 144.769 133.529L138.44 135.637C137.048 136.101 135.784 136.882 134.747 137.92C133.711 138.957 132.93 140.222 132.466 141.613L130.359 147.94C130.281 148.176 130.131 148.381 129.93 148.527C129.729 148.673 129.486 148.752 129.238 148.752C128.989 148.752 128.747 148.673 128.546 148.527C128.345 148.381 128.195 148.176 128.117 147.94L126.009 141.61C125.546 140.219 124.765 138.955 123.728 137.918C122.691 136.881 121.427 136.1 120.036 135.637L113.706 133.529C113.47 133.452 113.265 133.301 113.119 133.1C112.973 132.899 112.895 132.657 112.895 132.408C112.895 132.16 112.973 131.917 113.119 131.716C113.265 131.515 113.47 131.365 113.706 131.287L120.036 129.18C121.427 128.716 122.691 127.935 123.728 126.898C124.765 125.861 125.546 124.597 126.009 123.206L128.117 116.877Z"
            fill="url(#paint5_linear_68_12)"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_68_12"
            x="0.752197"
            y="0"
            width="248"
            height="248"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="-1" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_68_12"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_68_12"
              result="shape"
            />
          </filter>
          <filter
            id="filter1_d_68_12"
            x="42.752"
            y="49"
            width="164"
            height="168"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.00392157 0 0 0 0 0.101961 0 0 0 0 0.180392 0 0 0 0.18 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_68_12"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_68_12"
              result="shape"
            />
          </filter>
          <linearGradient
            id="paint0_linear_68_12"
            x1="81.2522"
            y1="11.5"
            x2="186.252"
            y2="227"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_68_12"
            x1="87.0522"
            y1="26.6333"
            x2="178.052"
            y2="213.4"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_68_12"
            x1="87.0522"
            y1="26.6333"
            x2="178.052"
            y2="213.4"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6DC1E7" />
            <stop offset="1" stopColor="#00AFFF" />
          </linearGradient>
          <linearGradient
            id="paint3_linear_68_12"
            x1="97.202"
            y1="53.1167"
            x2="163.702"
            y2="189.6"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0083BF" />
            <stop offset="1" stopColor="#0083BF" />
          </linearGradient>
          <linearGradient
            id="paint4_linear_68_12"
            x1="11.265"
            y1="111.166"
            x2="142.72"
            y2="111.166"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00AEFE" />
            <stop offset="1" stopColor="#011A2E" />
          </linearGradient>
          <linearGradient
            id="paint5_linear_68_12"
            x1="145.578"
            y1="132.41"
            x2="-16.8103"
            y2="132.41"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00AEFE" />
            <stop offset="1" stopColor="#011A2E" />
          </linearGradient>
        </defs>
      </svg>
    )}
  </div>
);
