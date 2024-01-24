import PropTypes from 'prop-types';
import React from 'react';
import { requireNativeComponent, findNodeHandle } from 'react-native';
import { NativeFunction } from '../utils/Bridge';

export class RNVideoRenderView extends React.Component {

  componentDidMount() {
    this.timeoutId = setTimeout(() => {
      NativeFunction.bindVideoView(findNodeHandle(this), this.props.tileId);
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
    NativeFunction.unbindVideoView(this.props.tileId);
  }

  render() {
    return <RNVideoRenderViewNative {...this.props} />;
  }
}

RNVideoRenderView.propTypes = {
  tileId: PropTypes.number,
};

var RNVideoRenderViewNative = requireNativeComponent('RNVideoView', RNVideoRenderView);
