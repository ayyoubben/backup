const { Op } = require("sequelize");
const converter = (filters) => {
    const filters2 = {}
    filters.forEach(f => {
        switch(f[1]) {
            case 'gt':
            filters2[f[0]] = {[Op.gt]: f[2]}
            break;
            case 'eq':
            filters2[f[0]] = {[Op.eq]: f[2]}
            break;
            case 'ne':
            filters2[f[0]] = {[Op.ne]: f[2]}
            break;
            case 'is':
            filters2[f[0]] = {[Op.is]: f[2]}
            break;
            case 'not':
            filters2[f[0]] = {[Op.not]: f[2]}
            break;  
            case 'gte':
            filters2[f[0]] = {[Op.gte]: f[2]}
            break;  
            case 'lt':
            filters2[f[0]] = {[Op.lt]: f[2]}
            break;
            case 'lte':
            filters2[f[0]] = {[Op.lte]: f[2]}
            break;  
            case 'between':
            filters2[f[0]] = {[Op.between]: f[2]}
            break;
            case 'notBetween':
            filters2[f[0]] = {[Op.notBetween]: f[2]}
            break;  
            case 'all':
            filters2[f[0]] = {[Op.all]: f[2]}
            break;  
            case 'in':
            filters2[f[0]] = {[Op.in]: f[2]}
            break;
            case 'notIn':
            filters2[f[0]] = {[Op.notIn]: f[2]}
            break;  
            case 'like':
            filters2[f[0]] = {[Op.like]: f[2]}
            break;  
            //
            case 'notLike':
            filters2[f[0]] = {[Op.notLike]: f[2]}
            break;
            case 'startsWith':
            filters2[f[0]] = {[Op.startsWith]: f[2]}
            break;
            case 'endsWith':
            filters2[f[0]] = {[Op.endsWith]: f[2]}
            break;  
            case 'substring':
            filters2[f[0]] = {[Op.substring]: f[2]}
            break;  
            case 'iLike':
            filters2[f[0]] = {[Op.iLike]: f[2]}
            break;
            case 'notILike':
            filters2[f[0]] = {[Op.notILike]: f[2]}
            break;  
            case 'regexp':
            filters2[f[0]] = {[Op.regexp]: f[2]}
            break;
            case 'notRegexp':
            filters2[f[0]] = {[Op.notRegexp]: f[2]}
            break;  
            case 'iRegexp':
            filters2[f[0]] = {[Op.iRegexp]: f[2]}
            break;
            case 'notIRegexp':
            filters2[f[0]] = {[Op.notIRegexp]: f[2]}
            break;
            case 'any':
            filters2[f[0]] = {[Op.any]: f[2]}
            break;  
            case 'match':
            filters2[f[0]] = {[Op.match]: f[2]}
            break;
        }
    })
    return filters2
}

module.exports = {converter}