module.exports = (sequelize, DataTypes) => {
  const GeneralPOModel = sequelize.define("GeneralPOModel", {
    shipToAddressLine1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipToAddressLine2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipToAddressLine3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buyer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buyerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buyerTel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requester: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requesterEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requesterTel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supervisor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supervisorEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    supervisorTel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    
    condition1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    condition3: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorEmail : {
      type:DataTypes.STRING,
      allowNull: false
    }
  });

  return GeneralPOModel;
};
