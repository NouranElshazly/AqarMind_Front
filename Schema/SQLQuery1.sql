
CREATE TABLE "User"(
    userId BIGINT IDENTITY(1,1) primary key NOT NULL, -- edit
    userName NVARCHAR(255) NOT NULL, --edit
    email  NVARCHAR(255) NOT NULL Unique, 
    fName NVARCHAR(255) NOT NULL,
    lName NVARCHAR(255) NOT NULL,
    flag_waiting_user INT NOT NULL,
    Role_name NVARCHAR(255) NOT NULL,
    Pass NVARCHAR(255) NOT NULL --edit
);


CREATE TABLE "posts"(
    "post_Id" BIGINT NOT NULL IDENTITY(1,1) primary key,
    "Landlord_id" BIGINT NOT NULL,
    "title" NVARCHAR(255) NOT NULL,
    "description" NVARCHAR(255) NOT NULL,
    "Price" FLOAT(53) NOT NULL,
    "location" NVARCHAR(255) NOT NULL,
    "rental_status" NVARCHAR(255) NOT NULL,
    "flag_waiting_post" BIGINT NOT NULL,
    "date_post" datetime NOT NULL
	    FOREIGN KEY ("Landlord_id")
        REFERENCES "User"(userId)
        ON UPDATE CASCADE
		ON DELETE CASCADE
);


CREATE TABLE "Saved_posts"( -- make composite key
    "tenant_Id" BIGINT NOT NULL, 
    "Post_Id" BIGINT NOT NULL,
	PRIMARY KEY ("tenant_Id","Post_Id"),
	FOREIGN KEY ("tenant_Id")
        REFERENCES "User"(userId)
		ON DELETE NO ACTION,

	FOREIGN KEY ("Post_Id")
        REFERENCES "posts"("post_Id")
	    ON UPDATE CASCADE
		ON DELETE CASCADE,
		
);

CREATE TABLE "Comments"(
    "Comment_Id"  BIGINT NOT NULL IDENTITY(1,1) primary key,
    "Post_Id" BIGINT NOT NULL,
    "user_Id" BIGINT NOT NULL,
    "description" NVARCHAR(255) NOT NULL,
    "date_comment" datetime NOT NULL,
	FOREIGN KEY ("user_Id")
        REFERENCES "User"(userId)
		ON DELETE NO ACTION,

	FOREIGN KEY ("Post_Id")
        REFERENCES "posts"("post_Id")
		ON UPDATE CASCADE
		ON DELETE CASCADE,
		
);

CREATE TABLE "messages"(
    "message_Id" BIGINT NOT NULL IDENTITY(1,1) primary key, -- edit name
    "landlord_Id" BIGINT NOT NULL,
    "tenant_Id" BIGINT NOT NULL,
    "Message" NVARCHAR(255) NOT NULL,
    "date_messge" datetime NOT NULL
	    FOREIGN KEY ("landlord_Id")
        REFERENCES "User"(userId)
        ON UPDATE CASCADE
		ON DELETE CASCADE,
	    FOREIGN KEY ("tenant_Id")
        REFERENCES "User"(userId)
		ON DELETE NO ACTION
);

