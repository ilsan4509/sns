const Sequelize = require('sequelize');

module.exports = class Domain extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      host: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      //무료 요금제, 프리미엄 요금제
      type: {
        type: Sequelize.ENUM('free', 'premium'),
        allowNull: false,
      },
      //restapi key 발급
      clientSecret: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      paranoid: true,
      modelName: 'Domain',
      tableName: 'domains',
    });
  }

  static associate(db) {
    db.Domain.belongsTo(db.User);
  }
};