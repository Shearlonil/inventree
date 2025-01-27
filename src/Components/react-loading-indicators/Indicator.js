import {
    ThreeDot,
    Atom,
    OrbitProgress,
    Mosaic,
    BlinkBlur,
    Commet,
    FourSquare,
    LifeLine,
    Riple,
    Slab,
    TrophySpin,
} from "react-loading-indicators";

/*  ref: https://react-loading-indicators.netlify.app/
    easing: linear, ease-in-out, ease-in
    OrbitProgress variant: disc, split-disc, dotted, track-disc, spokes
    ThreeDot variant: pulsate, windmill, bob, brick-stack
*/

const OribitalLoading = ({
    color = "#000000",
    size = "medium",
    variant = "track-disc",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <OrbitProgress
        variant={variant}
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const AtomLoading = (
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing
) => (
    <Atom
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const MosaicLoading = (
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing
) => (
    <Mosaic
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const ThreeDotLoading = ({
    color = "#000000",
    size = "medium",
    variant = "pulsate",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <ThreeDot
        variant={variant}
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const BlinkBlurLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <BlinkBlur
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const CommetLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <Commet
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const FourSquareLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <FourSquare
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const LifeLineLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <LifeLine
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const RippleLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <Riple
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const SlabLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <Slab
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

const TrophyLoading = ({
    color = "#000000",
    size = "medium",
    textColor = "#000000",
    text,
    speedPlus = "0",
    style,
    easing,
}) => (
    <TrophySpin
        color={color}
        size={size}
        speedPlus={speedPlus}
        easing={easing}
        textColor={textColor}
        text={text}
        style={style}
    />
);

export {
    OribitalLoading,
    AtomLoading,
    MosaicLoading,
    ThreeDotLoading,
    BlinkBlurLoading,
    CommetLoading,
    FourSquareLoading,
    LifeLineLoading,
    RippleLoading,
    SlabLoading,
    TrophyLoading,
};
