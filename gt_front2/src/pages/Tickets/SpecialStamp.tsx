import {
    CardMedia,
} from '@mui/material';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface SpecialStampProps {
    randKey?: number;
}

const SpecialStamp = (props: SpecialStampProps) => {
    const { randKey } = props;

    return (
        // https://www.pressman.ne.jp/archives/18598
        <SpecialStampDiv randKey={randKey ?? 0}>
            <CardMedia
                className='stamp'
                component="img"
                image='/apple-touch-icon.png'
            />
            <div className='postmark-div'>
                <div className='postmark'>SPECIAL</div>
            </div>
        </SpecialStampDiv>
    );
}

const postmarkPosition = (props: { randKey: number; }) => {
    let top, left;
    switch (props.randKey % 5) {
        case 0:
            top = 60;
            left = 60;
            break;
        case 1:
            top = 60;
            left = 50;
            break;
        case 2:
            top = 50;
            left = 60;
            break;
        case 3:
            top = 50;
            left = 50;
            break;
        case 4:
            top = 40;
            left = 50;
            break;
    }
    return css`
        top: ${top}px;
        left: ${left}px;
    `
}

const postmarkRotation = (props: { randKey: number; }) => {
    let deg;
    switch (props.randKey % 3) {
        case 0:
            deg = '3deg';
            break;
        case 1:
            deg = '-8deg';
            break;
        case 2:
            deg = '-25deg';
            break;
    }
    return css`
        -webkit-transform: rotate(${deg});
        transform: rotate(${deg});
    `
}

const SpecialStampDiv = styled.div`
    height: 200px;
    width: 175px;
    position: absolute;
    top: 7px;
    left: 17px;
    scale: 0.3 0.3;
    translate: -70px -70px;

    .stamp {
        height: 120px;
        width: 100px;
        padding: 10px;
        background-color: #ffffff;
        background: radial-gradient(at center, transparent, transparent 5px, #ffffff 6px);
        background-position: -10px -10px;
        background-size: 20px 20px;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
    }

    .postmark-div {
        position: absolute;
        ${postmarkPosition};
    }
    .postmark {
        position: relative;
        margin: 0;
        padding: 4px;
        height:  100px;
        width:  100px;
        border: 7px double #bb3e45;
        -webkit-border-radius: 50%;
        border-radius: 50%;
        color: #bb3e45;
        font-weight: 600;
        text-align: center;
        font-size: 22px;
        line-height: 100px;
        ${postmarkRotation};
    }
    .postmark::before {
        position: absolute;
        top: 24%;
        display: block;
        padding: 0 0 8px;
        width: 82%;
        border-bottom: 1px solid #bb3e45;
        content: ' ';
        font-size: 16px;
        line-height: 1;
    }
    .postmark::after {
        position: absolute;
        bottom: 30%;
        display: block;
        padding: 6px 0 0;
        width: 82%;
        border-bottom: 1px solid #bb3e45;
        content: ' ';
        font-size: 13px;
        line-height: 1;
    }
`;

export default SpecialStamp;