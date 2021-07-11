const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      //이미지 1개
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      //게시글 삭제는 바로 데이터 삭제될 수 있도록 함
      paranoid: false,
      //mb4, 이모티콘 사용 가능
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    //다대다 관계
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
  }
};