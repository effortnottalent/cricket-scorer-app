export default function Symbol({ event, imgIndex }) {
    const symbolHeight = 36;
    return (<div
        className='sprite'
        style={{backgroundPosition: '-8px ' + (symbolHeight * -imgIndex - 8) + 'px'}}
    />);
}