module.exports = (sequelize, DataTypes) => {
  const ContactDatabase = sequelize.define(
    "ContactDatabase",
    {
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplierName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplierWebsite: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      supplierEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      responsive: {
        type: DataTypes.BOOLEAN,
      },
      remark1: {
        type: DataTypes.STRING,
      },
      remark2: {
        type: DataTypes.STRING,
      },
      remark3: {
        type: DataTypes.STRING,
      },
      place: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      contactNo1: {
        type: DataTypes.STRING,
      },
      contactNo2: {
        type: DataTypes.STRING,
      },
    },
    {
      uniqueKeys: {
        uniqueCategorySupplierName: {
          fields: ["category", "supplierName"],
        },
      },
    }
  );

  return ContactDatabase;
};
