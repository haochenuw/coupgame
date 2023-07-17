import Button from "@material-ui/core/Button";
import { makeStyles, withStyles} from '@material-ui/core/styles';

export const ColorButton = withStyles(() => ({
    root: {
        backgroundColor: "#347dc9",
        color: "#ffffff", 
        '&:hover': {
            backgroundColor: "#197de6",
        },
        padding: "6px 16px", 
        margin: "16px", 
    },
}))(Button);

export const ActionButton = ColorButton; 

export const ErrorButton = withStyles(() => ({
    root: {
        backgroundColor: "red",
        color: "#ffffff", 
        // backgroundColor: purple[500],
        '&:hover': {
            backgroundColor: "orange",
        },
        padding: "6px 16px", 
        margin: "16px", 
    },
}))(Button);

export const WarningButton = withStyles(() => ({
    root: {
        backgroundColor: "#B10A2E",
        color: "#ffffff", 
        '&:hover': {
            backgroundColor: "#C42021", 
        },
        padding: "6px 16px", 
        margin: "16px", 
    },
}))(Button);

const useStyles = props => makeStyles( () => ({
    root: {
        backgroundColor: props.backgroundColor,
        color: props.color, 
        '&:hover': {
            backgroundColor: props.hoverBackGroundColor,
        },
        padding: "6px 16px", 
        margin: "16px", 
    }
}));


const ColorButtonBase = (props) => {
    const params = {
        color: props.color,
        backgroundColor: props.backgroundColor, 
        hoverBackGroundColor: props.hoverBackGroundColor, 
    }; 
    const classes = useStyles(params); 
    return <Button className = {classes.root}></Button>
}