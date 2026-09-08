import React from 'react';

/**
 * RudeStingraySwitch - Authentic Uiverse component by njesenberger
 * https://uiverse.io/njesenberger/rude-stingray-22
 * Tactile skeuomorphic physical hardware switch with 12 grip dots.
 */
export default function RudeStingraySwitch({
  checked = false,
  onChange = () => {},
  labelLeft = 'MANUAL',
  labelRight = 'SMART AUTO',
  className = ''
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {labelLeft && (
        <span 
          onClick={() => onChange(false)}
          className={`text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200 ${
            !checked ? 'text-primary font-black' : 'text-primary/40 hover:text-primary/70'
          }`}
        >
          {labelLeft}
        </span>
      )}

      {/* Embedded Scoped Style for Rude-Stingray-22 with smooth responsive em scaling */}
      <style>{`
        .rude-stingray-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          border-radius: 0.5em;
          padding: 0.125em;
          background-image: linear-gradient(to bottom, #d5d5d5, #e8e8e8);
          box-shadow: 0 1px 1px rgb(255 255 255 / 0.6), 0 2px 4px rgba(0, 0, 0, 0.15);
          font-size: 13px; /* Precision fit into the header UI without overflowing */
          line-height: 1;
        }

        .rude-stingray-checkbox {
          appearance: none;
          position: absolute;
          inset: 0;
          z-index: 10;
          border-radius: inherit;
          width: 100%;
          height: 100%;
          font: inherit;
          opacity: 0;
          cursor: pointer;
          margin: 0;
        }

        .rude-stingray-container {
          display: flex;
          align-items: center;
          position: relative;
          border-radius: 0.375em;
          width: 3em;
          height: 1.5em;
          background-color: #d1cfc7;
          box-shadow: inset 0 0 0.0625em 0.125em rgb(255 255 255 / 0.25), inset 0 0.0625em 0.125em rgb(0 0 0 / 0.45);
          transition: background-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .rude-stingray-checkbox:checked + .rude-stingray-container {
          background-color: #00f99b;
          box-shadow: inset 0 0 0.0625em 0.125em rgb(255 255 255 / 0.4), inset 0 0.0625em 0.125em rgb(0 71 42 / 0.5), 0 0 8px rgba(0, 249, 155, 0.35);
        }

        .rude-stingray-button {
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0.0625em;
          border-radius: 0.3125em;
          width: 1.375em;
          height: 1.375em;
          background-color: #fbf9f0;
          box-shadow: inset 0 -0.0625em 0.0625em 0.125em rgb(0 0 0 / 0.1), inset 0 -0.125em 0.0625em rgb(0 0 0 / 0.2), inset 0 0.1875em 0.0625em rgb(255 255 255 / 0.6), 0 0.125em 0.125em rgb(0 0 0 / 0.4);
          transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .rude-stingray-checkbox:checked + .rude-stingray-container > .rude-stingray-button {
          left: 1.5625em;
        }

        .rude-stingray-circles {
          display: grid;
          grid-template-columns: repeat(3, min-content);
          gap: 0.125em;
          position: absolute;
          margin: 0 auto;
        }

        .rude-stingray-circle {
          border-radius: 50%;
          width: 0.125em;
          height: 0.125em;
          background-image: radial-gradient(circle at 50% 0, #ffffff, #a0a09a);
        }
      `}</style>

      <div className="rude-stingray-wrapper">
        <input 
          className="rude-stingray-checkbox" 
          type="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          title={checked ? 'Auto detection active' : 'Manual selection active'}
        />
        <div className="rude-stingray-container">
          <div className="rude-stingray-button">
            <div className="rude-stingray-circles">
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
              <div className="rude-stingray-circle" />
            </div>
          </div>
        </div>
      </div>

      {labelRight && (
        <span 
          onClick={() => onChange(true)}
          className={`text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200 ${
            checked ? 'text-[#006d41] font-black' : 'text-primary/40 hover:text-primary/70'
          }`}
        >
          {labelRight}
        </span>
      )}
    </div>
  );
}
