import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { Panel } from 'react-bootstrap';

export class ImagePanel extends Component {
  constructor(props) {
    super(props);
    this.renderImage = this.renderImage.bind(this);
  }

  renderImage(image, index) {
    const alt = image.caption || this.props.altText;
    const src = image.url;
    const imageStyles = {
      width: '100%',
      marginTop: index > 0 ? '15px' : 0,
    };

    return (
      <img
        alt={alt}
        key={image.url}
        src={src}
        style={imageStyles}
      />
    );
  }

  render() {
    const { images } = this.props;

    if (!images.length) {
      return null;
    }

    return (
      <Panel collapsible defaultExpanded header="Kuvat">
        {_.map(images, this.renderImage)}
      </Panel>
    );
  }
}

ImagePanel.propTypes = {
  altText: PropTypes.string.isRequired,
  images: PropTypes.array.isRequired,
};

export default ImagePanel;