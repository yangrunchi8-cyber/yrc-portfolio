// A separate transparent ornament keeps the page plate and typography stationary.
export default function RotatingFlower({className=''}){return <span className={`flower-entry ${className}`} aria-hidden="true"><img className="flower-spin" src="/assets/flower-glass-v2.png" width="355" height="360" alt="" draggable="false"/></span>}
