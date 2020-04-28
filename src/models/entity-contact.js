import { UUIDV4 } from "sequelize";

const entityContact = (sequelize, DataTypes) => {
    // Defining our EntityContact object.
    const EntityContact = sequelize.define('EntityContact', {
            id: {
                type: DataTypes.UUID,
                unique: true,
                primaryKey: true,
                defaultValue: UUIDV4
            },
            entityId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Entity',
                    key: 'id'
                }
            },
            contactId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Contact',
                    key: 'id'
                }
            },
            relationshipTitle: {
                type: DataTypes.STRING,
                defaultValue: "default",
            }
        },
        {
            schema: process.env.DATABASE_SCHEMA
        });

    EntityContact.createIfNew = async (ec) => {
        const ecObject = await EntityContact.findOne({
            where: { 
                entityId: ec.entityId,
                contactId: ec.contactId
            }
        });
        if (!ecObject) {
            await EntityContact.create(ec)
        }
    }

    return EntityContact;
};

export default entityContact;