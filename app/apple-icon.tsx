import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #4f46e5, #ec4899)',
          borderRadius: '24px',
        }}
      >
        <span
          style={{
            fontSize: 80,
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          J
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
