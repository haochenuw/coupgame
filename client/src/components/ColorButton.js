import Button from "@material-ui/core/Button";
import { makeStyles, withStyles} from '@material-ui/core/styles';

export const ColorButton = withStyles(() => ({
    root: {
        backgroundColor: "#347dc9",
        color: "#ffffff", 
        // backgroundColor: purple[500],
        '&:hover': {
            backgroundColor: "#197de6",
        },
        padding: "6px 16px", 
        margin: "16px", 
    },
}))(Button);