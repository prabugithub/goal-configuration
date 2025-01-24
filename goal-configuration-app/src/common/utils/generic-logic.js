// /f:/projects/personal project/goal-configuration/goal-configuration-app/src/common/utils/generic-logic.js


function numberArray(length, startFrom) {
    return Array.from({ length }, (_, i) => i + startFrom);
}
function capitalizeFirstLetter(sentence) {
    if (!sentence) return '';
    return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
  }


const GenericLogic = {
    numberArray,
    capitalizeFirstLetter,
}
export default GenericLogic;