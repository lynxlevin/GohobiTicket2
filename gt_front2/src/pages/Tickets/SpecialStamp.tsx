import {
    CardMedia,
} from '@mui/material';
import styled from '@emotion/styled';

const SpecialStamp = () => {
    // MYMEMO: id を元に 角度や位置をランダムにしてみる？
    return (
        // https://www.pressman.ne.jp/archives/18598
        <SpecialStampDiv>
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
        top: 60px;
        left: 50px;
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
        -webkit-transform: rotate(-16deg);
        transform: rotate(-16deg);
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