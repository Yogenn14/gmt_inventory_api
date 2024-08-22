const { response } = require("express");
const db = require("../models");
const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { verify } = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const createNotification = require("../services/emailServices");
const { Sequelize } = require("sequelize");
const { search } = require("../routes/productRouter");
const {Op} = require('sequelize');
//create model
const contactDatabase = db.contactDatabase;

exports.createContact = async (req, res) => {
    try {
        const {
            category, supplierName, supplierWebsite, supplierEmail, responsive, 
            remark1, remark2, remark3, place, country, contactNo1, contactNo2
        } = req.body;

      

        const newContact = await contactDatabase.create({
            category, supplierName, supplierWebsite, supplierEmail, responsive, 
            remark1, remark2, remark3, place, country, contactNo1, contactNo2
        });

        res.status(201).json(newContact);
    } catch (error) {
        console.error("Error creating contact:", error);
        res.status(500).json({ message: "Error creating contact" });
    }
};


exports.getAllContacts = async (req, res) => {
    const {category, country , page = 1  , pageSize =5, supplierName} = req.query;

    let queryCondition = {
        limit: parseInt(pageSize),
        offset : (page -1) * parseInt(pageSize),
        where : {}
    };

    if (category) {
        queryCondition = { where: { category } };
    }

    if(country) {
        queryCondition = {where : {country}}
    }

    if(supplierName) {
        queryCondition = {where : {supplierName: {[Op.like]: `%${supplierName}%`}}}
    }

    try {

        const { count, rows: contacts } = await contactDatabase.findAndCountAll(queryCondition);
        const totalPages = Math.ceil(count / pageSize);

        res.status(200).json({
            pagination: {
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalItems: count,
                totalPages: totalPages
            },
            data: contacts,

        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({ message: "Error fetching contacts" });
    }
};

exports.getAllCategories = async (req,res) => {
    try {
        const contactCateogries = await contactDatabase.findAll({attributes : [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']]});
        res.status(200).json(contactCateogries);
    } catch (error) {
        console.error("Error fetching categories", error);
        res.status(500).json({message: "Error fetching categories"})
    }
}


exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await contactDatabase.findOne({ where: { id } });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.status(500).json({ message: "Error fetching contact" });
    }
};


exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category, supplierName, supplierWebsite, supplierEmail, responsive, 
            remark1, remark2, remark3, place, county, contactNo1, contactNo2
        } = req.body;

        const contact = await contactDatabase.findOne({ where: { id } });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        const updatedContact = await contact.update({
            category, supplierName, supplierWebsite, supplierEmail, responsive, 
            remark1, remark2, remark3, place, county, contactNo1, contactNo2
        });

        res.status(200).json(updatedContact);
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({ message: "Error updating contact" });
    }
};


exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await contactDatabase.findOne({ where: { id } });

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        await contact.destroy();

        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ message: "Error deleting contact" });
    }
};
