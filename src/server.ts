import express = require("express");
import { isIterationStatement, isParseTreeNode } from "typescript";
import {Account} from "./model/Account";
import {AccountExtended} from "./model/AccountExtended";


const app: express.Application = express();

const { Sequelize, Op, DataTypes } = require("sequelize");
const sequelize = new Sequelize("yusufadisaputrotest", "postgres", "1234", {
    host: "localhost",
    dialect: "postgres"
});

Account.init({
    nik: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        defaultValue: "INDONESIA",
    }
}, {
  sequelize,
  modelName: 'NewEmployee'
});

AccountExtended.init({
    nik: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
    },
    firstName: {
        type: DataTypes.STRING,
    },
    sex: {
        type: DataTypes.STRING,
        defaultValue: "unknown",
    }
}, {
  sequelize,
  modelName: 'companies'
});

AccountExtended.belongsTo(Account, {
    foreignKey: 'nik',
});
// Account.belongsTo(AccountExtended, {
//     foreignKey: 'nik'
// });
/**
 * APIs are bellow
 */
app.post("/create-account", async function (req, res) {
    let account1: any;
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        account1 = await Account.create({ 
            dateOfBirth: req.query.dateOfBirth, 
            placeOfBirth: req.query.placeOfBirth,
            firstName: req.query.firstName, 
            lastName: req.query.lastName,
        }).then(function(item){
            return item;
        }).catch(function (err) {
            res.status(400);
            res.send("Fail to insert new Account");
            throw "Fail to insert new Account";
        });
        await AccountExtended.create({ 
            firstName: req.query.firstName, 
            sex: req.query.sex, 
            companyId: req.query.companyId,
        }).then(function(item){
            res.status(200);
        }).catch(function (err) {
            res.status(400);
            res.send("Fail to insert new AccountExtended");
            throw "Fail to insert new AccountExtended";
        });
        res.send(account1);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

app.put("/edit-account/:nik", async function (req, res) {
        let account: any;
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            account = await Account.update({ 
                lastName: req.query.lastName, 
                firstName: req.query.firstName, 
                placeOfBirth: req.query.placeOfBirth,
                dateOfBirth: req.query.dateOfBirth,
            }, {
                where: {
                    nik: req.params.nik
                }
            }).then(function(item){
            }).catch(function (err) {
                res.status(400);
                res.send("Fail to update Account");
                throw "Fail to update Account";
            });
            await AccountExtended.update({ 
                companyId: req.query.companyId, 
                firstName: req.query.firstName, 
                sex: req.query.sex,
            }, {
                where: {
                    nik: req.params.nik
                }
            }).then(function(item){
                if(item == 0){
                    res.send("failed to update (may not exist yet)");
                }else{
                    res.send("success");
                }
                console.log("item ", item);
            }).catch(function (err) {
                res.status(400);
                res.send("Fail to update Account");
                throw "Fail to update Account";
            });
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
});

app.delete("/delete-account/:nik", async function (req, res) {
    let account: any;
    try {
        await sequelize.authenticate();
        account = await AccountExtended.destroy({ 
            where: {
                nik: req.params.nik
            }
        }).then(function(item){
        }).catch(function (err) {
            res.status(400);
            res.send("failed to delete");
        });
        await Account.destroy({ 
            where: {
                nik: req.params.nik
            }
        }).then(function(item){
            res.status(200);
            if(item == 0){
                res.send("failed to delete (may not exist yet)");
            }else{
                res.send("success");
            }
        }).catch(function (err) {
            res.status(400);
            res.send("failed to delete");
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

app.get("/get-all-accounts", async function (req, res) {
    let account: any;
    try {
        await sequelize.authenticate();
        await sequelize.sync();
            if(req.query.sort != undefined) {
                account = await AccountExtended.findAll({
                    order: [
                        ['nik', req.query.sort],
                    ],
                    include: 'NewEmployee'
                }).then(function(item){
                    res.status(200);
                    res.send(item);
                }).catch(function (err) {
                    res.status(400);
                    res.send(err);
                    throw "Fail to load Account";
                });
            }else {
                account = await AccountExtended.findAll({
                    order: [
                        ['nik', 'ASC'],
                    ],
                    include: 'NewEmployee'
                }).then(function(item){
                    res.status(200);
                    res.send(item);
                }).catch(function (err) {
                    res.status(400);
                    res.send(err);
                    throw "Fail to load Account";
                });
            }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

app.listen(3000, function () {
    console.log("Port 3000");
});