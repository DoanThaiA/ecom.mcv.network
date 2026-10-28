/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/state-in-constructor */
import { Button } from '@mui/material';
import React from 'react';

interface ChunkErrorBoundaryState {
  hasError: boolean;
}

class ChunkErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = { hasError: false };

  // static getDerivedStateFromError(error: Error | undefined): ChunkErrorBoundaryState {
  //   // Only show refresh for chunk load errors
  //   console.log('getDerivedStateFromError', error);
  //   try {
  //     if (
  //       error?.name === 'ChunkLoadError' ||
  //       error?.message.includes('Failed to fetch dynamically imported module')
  //     ) {
  //       window.location.reload();
  //       return { hasError: true };
  //     }
  //     return { hasError: false };
  //   } catch (e) {
  //     return { hasError: false };
  //   }
  // }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p>Failed to load component.</p>
          <Button onClick={() => window.location.reload()}>Refresh page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
