import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CardMedia } from '@mui/material';

interface MoonPhaseProps {
    date: Date;
}

type MoonImagePositionsKey =
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30;

const MOON_IMAGE_POSITIONS = {
    0: { top: -34, left: -142 },
    1: { top: -39, left: -512 },
    2: { top: -39, left: -886 },
    3: { top: -39, left: -1259 },
    4: { top: -38, left: -1636 },
    5: { top: -42, left: -2014 },
    6: { top: -382, left: -144 },
    7: { top: -387, left: -515 },
    8: { top: -388, left: -890 },
    9: { top: -387, left: -1263 },
    10: { top: -386, left: -1639 },
    11: { top: -391, left: -2017 },
    12: { top: -731, left: -150 },
    13: { top: -736, left: -521 },
    14: { top: -737, left: -895 },
    15: { top: -737, left: -1264 },
    16: { top: -735, left: -1643 },
    17: { top: -740, left: -2019 },
    18: { top: -1090, left: -141 },
    19: { top: -1097, left: -515 },
    20: { top: -1097, left: -896 },
    21: { top: -1094, left: -1273 },
    22: { top: -1094, left: -1640 },
    23: { top: -1095, left: -2009 },
    24: { top: -1444, left: -148 },
    25: { top: -1451, left: -517 },
    26: { top: -1448, left: -893 },
    27: { top: -1448, left: -1266 },
    28: { top: -1450, left: -1641 },
    29: { top: -1454, left: -2038 },
    30: { top: -34, left: -142 },
};

const MoonPhase = (props: MoonPhaseProps) => {
    const { date } = props;

    const getMoonPhase = (dateArg: Date): number => {
        const ONE_LUNAR_MONTH = 29.53059;

        const year = dateArg.getFullYear();
        const date = new Date(year, dateArg.getMonth(), dateArg.getDate());
        const date0101 = new Date(year, 0, 1);
        const daysInTheYear = (date.valueOf() - date0101.valueOf()) / 1000 / 60 / 60 / 24 + 1;

        const yearMinus = year - 1;
        const gregorianDate0100 = yearMinus * 365 + Math.trunc(yearMinus / 4) - Math.trunc(yearMinus / 100) + Math.trunc(yearMinus / 400);
        const gregorianDate = gregorianDate0100 + daysInTheYear;

        const moonPhase = (((gregorianDate - 10.7) / ONE_LUNAR_MONTH) % 1) * ONE_LUNAR_MONTH;
        return Math.round(moonPhase * 10) / 10;
    };

    const moonPhase = getMoonPhase(date);
    // Use this image: https://www.ac-illust.com/main/detail.php?id=2556717&word=月%E3%80%80満ち欠け&data_type=&from_order_history=&downloader_register=success#goog_rewarded
    const moonPhaseImage = '/free_images/moon_phase.png';

    return (
        <MoonPhaseDiv roundedMoonPhase={Math.round(moonPhase) as MoonImagePositionsKey}>
            <div className="moon-scaler">
                <CardMedia className="moon" component="div" image={moonPhaseImage} />
            </div>
        </MoonPhaseDiv>
    );
};

const moonImagePosition = (props: { roundedMoonPhase: MoonImagePositionsKey }) => {
    const position = MOON_IMAGE_POSITIONS[props.roundedMoonPhase];
    return css`
        background-position: top ${position.top}px left ${position.left}px;
    `;
};

const MoonPhaseDiv = styled.div`
    position: absolute;
    top: 16px;
    left: 20px;

    .moon-scaler {
        height: 0px;
        width: 0px;
        scale: 0.08 0.08;
    }

    .moon {
        height: 330px;
        width: 330px;
        background-size: 2500px 1800px;
        ${moonImagePosition};
    }
`;

export default MoonPhase;
