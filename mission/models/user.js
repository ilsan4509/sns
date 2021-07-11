const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  //sequelize에선 static으로 해야 mysql연동된다고 해서 따름.
  //id primary 생략
  static init(sequelize) {
    return super.init({
      email: {
        type: Sequelize.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      //암호화때문에 String 100으로 넉넉히 둠, SNS로그인하는 경우가 있기 때문에 Null 허용
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      //로그인 제공자 local
      provider: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'local',
      },
      //로그인 제공자 sns
      snsId: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      //계정복구할 수 있기 때문에, 삭제를 구분하는 경우로 세팅
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    //사용자간 팔로잉 팔로워 관계, 누가 팔로워고 누가 팔로잉인지 구분
    db.User.belongsToMany(db.User, {
      foreignKey: 'followingId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
  }
};