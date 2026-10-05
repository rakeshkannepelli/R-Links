import React from 'react';

/**
 * Chain.jsx — Custom LDRS "Chain" Loader Component
 * 
 * Concept:
 * Two interlocked chain links (rotated -45deg).
 * A pulse of light travels around each link, with the second link offset by half a cycle.
 * The links gently pull apart and snap back together in sync with the speed.
 */
const LINK_A = 'M13 18H23A7 7 0 0 1 23 32H13A7 7 0 0 1 13 18Z';
const LINK_B = 'M27 18H37A7 7 0 0 1 37 32H27A7 7 0 0 1 27 18Z';

export default function Chain({
  size = 50,
  color = '#00f99b',
  speed = 1.6,
  stroke = 3,
  bgOpacity = 0.15,
}) {
  const sizeNum = typeof size === 'number' ? size : parseInt(size, 10);

  return (
    <div
      className="uib-chain-root"
      style={{
        '--uib-size': `${sizeNum}px`,
        '--uib-color': color,
        '--uib-speed': `${speed}s`,
        '--uib-bg-opacity': bgOpacity,
        '--uib-stroke': stroke,
      }}
    >
      <svg
        className="container"
        viewBox="0 0 50 50"
        height={sizeNum}
        width={sizeNum}
      >
        <g transform="rotate(-45 25 25)">
          <g className="link-a">
            <path
              className="track"
              d={LINK_A}
              pathLength="100"
              strokeWidth={stroke}
              fill="none"
            />
            <path
              className="car"
              d={LINK_A}
              pathLength="100"
              strokeWidth={stroke}
              fill="none"
            />
          </g>
          <g className="link-b">
            <path
              className="track"
              d={LINK_B}
              pathLength="100"
              strokeWidth={stroke}
              fill="none"
            />
            <path
              className="car"
              d={LINK_B}
              pathLength="100"
              strokeWidth={stroke}
              fill="none"
            />
          </g>
        </g>
      </svg>

      <style>{`
        .uib-chain-root {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: var(--uib-size);
          width: var(--uib-size);
        }

        .uib-chain-root .container {
          height: var(--uib-size);
          width: var(--uib-size);
          overflow: visible;
        }

        .uib-chain-root .track,
        .uib-chain-root .car {
          fill: none;
          stroke: var(--uib-color);
          transition: stroke 0.5s ease;
        }

        .uib-chain-root .track {
          opacity: var(--uib-bg-opacity);
        }

        .uib-chain-root .car {
          stroke-dasharray: 25, 75;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: chain-flow var(--uib-speed) linear infinite;
          will-change: stroke-dashoffset;
        }

        .uib-chain-root .link-b .car {
          animation-delay: calc(var(--uib-speed) * -0.5);
        }

        .uib-chain-root .link-a {
          animation: chain-pull-a var(--uib-speed) ease-in-out infinite;
          will-change: transform;
        }

        .uib-chain-root .link-b {
          animation: chain-pull-b var(--uib-speed) ease-in-out infinite;
          will-change: transform;
        }

        @keyframes chain-flow {
          to {
            stroke-dashoffset: -100;
          }
        }

        @keyframes chain-pull-a {
          50% {
            transform: translateX(-2.5px);
          }
        }

        @keyframes chain-pull-b {
          50% {
            transform: translateX(2.5px);
          }
        }
      `}</style>
    </div>
  );
}
