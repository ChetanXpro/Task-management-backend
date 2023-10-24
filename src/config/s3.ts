import log from '../utils/logger'
import AWS from 'aws-sdk'

interface IUploadParams {
	s3ObjectKey: string
	s3Bucket: string
}

export const generatePreSignedGetUrl = async (payload: IUploadParams) => {
	try {
		const { s3ObjectKey, s3Bucket } = payload

		const URL_EXPIRATION_TIME = 60000

		const myBucket = new AWS.S3({
			signatureVersion: 'v4',
			params: { Bucket: s3Bucket },
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.REGION,
		})
		return new Promise((resolve, reject) => {
			myBucket.getSignedUrl(
				'getObject',
				{
					Key: s3ObjectKey,

					Expires: URL_EXPIRATION_TIME,
				},
				(err, url) => {
					if (err) {
						log.error(err)
						return reject(err)
					}
					resolve(url) // API Response Here
				}
			)
		})
	} catch (error) {
		log.info('S3 GET PRESIGN URL ERROR:  ', error)
	}
}

const URL_EXPIRATION_TIME = 600 // in seconds
const S3_BUCKET = process.env.S3_BUCKET

interface PresignPayload {
	fileType: string
	s3ObjectKey: string
}

export const generatePreSignedPutUrl = async (payload: PresignPayload) => {
	try {
		const { fileType, s3ObjectKey } = payload

		AWS.config.update({
			signatureVersion: 'v4',
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.REGION,
		})

		const myBucket = new AWS.S3({
			params: { Bucket: S3_BUCKET },
		})

		return new Promise((resolve, reject) => {
			myBucket.getSignedUrl(
				'putObject',
				{
					Key: s3ObjectKey,
					ContentType: fileType,
					Expires: URL_EXPIRATION_TIME,
				},
				(err, url) => {
					if (err) {
						log.error(err)

						return reject(err)
					} else {
						resolve(url) // API Response Here
					}
				}
			)
		})
	} catch (error: any) {
		log.info('S3 GET PRESIGN URL ERROR:  ', error)
	}
}
