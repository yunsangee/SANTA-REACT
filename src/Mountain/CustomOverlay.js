export const createCustomOverlay = (naver) => {
  return class CustomOverlay extends naver.maps.OverlayView {
    constructor(options) {
      super();
      this._element = document.createElement('div');
      this._element.innerHTML = options.content;
      this._element.style.position = 'absolute';
      this._element.style.zIndex = '100';
      this._position = options.position;
      this._offset = options.offset || { x: 0, y: 0 }; 
      this.setMap(options.map);
    }

    onAdd() {
      const overlayLayer = this.getPanes().overlayLayer;
      overlayLayer.appendChild(this._element);
    }

    draw() {
      const projection = this.getProjection();
      const position = this._position;
      const pixelPosition = projection.fromCoordToOffset(position);

      this._element.style.left = `${pixelPosition.x + this._offset.x}px`;
      this._element.style.top = `${pixelPosition.y + this._offset.y}px`;
    }

    onRemove() {
      if (this._element.parentNode) {
        this._element.parentNode.removeChild(this._element);
        this._element = null;
      }
    }
  };
};